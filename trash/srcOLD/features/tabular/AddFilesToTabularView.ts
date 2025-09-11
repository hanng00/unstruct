import { SQSClient, SendMessageBatchCommand } from "@aws-sdk/client-sqs";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import { withCors } from "../../utils/cors";
import { getEnvOrThrow } from "../../utils/env";
import { badRequest, unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { DataModelRepository } from "../data-model/repositories/data-model-repository";
import { TabularRepository } from "./repositories/tabular-repository";

const RequestSchema = z.object({ fileIds: z.array(z.string().min(1)).min(1) });

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

    const body = JSON.parse(event.body || "{}");
    const input = RequestSchema.parse(body);

    // Fetch view to obtain data model and verify ownership
    const resView = await repo.getView(tabularViewId);
    if (!resView.success) return { statusCode: 404, body: JSON.stringify({ error: "View not found" }), headers: withCors({ "Content-Type": "application/json" }) };
    if (resView.view.userId !== user.id) return unauthorized();

    // Get the data model if one is associated with the view
    let dataModel: { id: string; schemaJson: unknown; version: number } | null = null;
    if (resView.view.dataModelId) {
      const fullDataModel = await dataModelRepo.getDataModel(resView.view.dataModelId);
      if (!fullDataModel) {
        return { statusCode: 404, body: JSON.stringify({ error: "Data model not found" }), headers: withCors({ "Content-Type": "application/json" }) };
      }
      dataModel = { id: fullDataModel.id, schemaJson: fullDataModel.schemaJson, version: fullDataModel.version };
    }

    await repo.queueExtractionsForFiles({ tabularViewId, userId: user.id, fileIds: input.fileIds, dataModel });

    // Enqueue SQS messages
    const chunks: string[][] = [];
    for (let i = 0; i < input.fileIds.length; i += 10) chunks.push(input.fileIds.slice(i, i + 10));
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
    }

    return { statusCode: 202, body: JSON.stringify({ enqueued: input.fileIds.length }), headers: withCors({ "Content-Type": "application/json" }) };
  } catch (e: any) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }), headers: withCors({ "Content-Type": "application/json" }) };
  }
};


