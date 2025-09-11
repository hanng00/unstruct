import { SQSClient, SendMessageBatchCommand } from "@aws-sdk/client-sqs";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { withCors } from "../../utils/cors";
import { getEnvOrThrow } from "../../utils/env";
import { badRequest, unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { DataModelRepository } from "../data-model/repositories/data-model-repository";
import { TabularRepository } from "./repositories/tabular-repository";

const repo = new TabularRepository();
const dataModelRepo = new DataModelRepository();
const sqs = new SQSClient({});
const queueUrl = getEnvOrThrow("EXTRACTION_QUEUE_URL");

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();
    
    const tabularViewId = event.pathParameters?.tabularViewId;
    if (!tabularViewId) return badRequest("'tabularViewId' is required");

    // Fetch view to obtain data model and verify ownership
    const resView = await repo.getView(tabularViewId);
    if (!resView.success) {
      return { 
        statusCode: 404, 
        body: JSON.stringify({ error: "View not found" }), 
        headers: withCors({ "Content-Type": "application/json" }) 
      };
    }
    if (resView.view.userId !== user.id) return unauthorized();

    // Get the data model if one is associated with the view
    let dataModel: { id: string; schemaJson: unknown; version: number } | null = null;
    if (resView.view.dataModelId) {
      const fullDataModel = await dataModelRepo.getDataModel(resView.view.dataModelId);
      if (!fullDataModel) {
        return { 
          statusCode: 404, 
          body: JSON.stringify({ error: "Data model not found" }), 
          headers: withCors({ "Content-Type": "application/json" }) 
        };
      }
      dataModel = { id: fullDataModel.id, schemaJson: fullDataModel.schemaJson, version: fullDataModel.version };
    }

    // Get all existing extractions for this tabular view to find unique file IDs
    const allExtractions = await repo.listExtractions(tabularViewId, 1000); // Get up to 1000 extractions
    if (!allExtractions.success) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "Failed to fetch extractions" }), 
        headers: withCors({ "Content-Type": "application/json" }) 
      };
    }

    // Extract unique file IDs from existing extractions
    const fileIds = [...new Set(allExtractions.extractions.map(extraction => extraction.fileId))];
    
    if (fileIds.length === 0) {
      return { 
        statusCode: 200, 
        body: JSON.stringify({ message: "No files found to process", enqueued: 0 }), 
        headers: withCors({ "Content-Type": "application/json" }) 
      };
    }

    // Enqueue SQS messages for all files
    const chunks: string[][] = [];
    for (let i = 0; i < fileIds.length; i += 10) {
      chunks.push(fileIds.slice(i, i + 10));
    }
    
    let totalEnqueued = 0;
    for (const chunk of chunks) {
      await sqs.send(
        new SendMessageBatchCommand({
          QueueUrl: queueUrl,
          Entries: chunk.map((fileId, idx) => ({
            Id: `${Date.now()}-${idx}-${fileId}`,
            MessageBody: JSON.stringify({ tvId: tabularViewId, userId: user.id, fileId, dataModel }),
          })),
        })
      );
      totalEnqueued += chunk.length;
    }

    return { 
      statusCode: 202, 
      body: JSON.stringify({ 
        message: `Enqueued ${totalEnqueued} files for extraction`,
        enqueued: totalEnqueued,
        fileIds 
      }), 
      headers: withCors({ "Content-Type": "application/json" }) 
    };
  } catch (e: any) {
    return { 
      statusCode: 400, 
      body: JSON.stringify({ error: e.message }), 
      headers: withCors({ "Content-Type": "application/json" }) 
    };
  }
};
