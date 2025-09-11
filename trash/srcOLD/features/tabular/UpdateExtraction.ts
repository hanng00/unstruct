import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import { withCors } from "../../utils/cors";
import { badRequest, unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { TabularRepository } from "./repositories/tabular-repository";

const RequestSchema = z.object({
  data: z.record(z.string(), z.unknown()).optional(),
});

const repo = new TabularRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const tabularViewId = event.pathParameters?.tabularViewId;
    const fileId = event.pathParameters?.fileId;
    
    if (!tabularViewId) return badRequest("'tabularViewId' is required");
    if (!fileId) return badRequest("'fileId' is required");

    const body = JSON.parse(event.body || "{}");
    const input = RequestSchema.parse(body);

    // Verify the extraction exists and belongs to the user
    const existingExtraction = await repo.getExtraction(tabularViewId, fileId);
    if (!existingExtraction) {
      return { 
        statusCode: 404, 
        body: JSON.stringify({ error: "Extraction not found" }), 
        headers: withCors({ "Content-Type": "application/json" }) 
      };
    }

    if (existingExtraction.userId !== user.id) {
      return unauthorized();
    }

    // Update the extraction with new data
    const updatedExtraction = await repo.updateExtractionData(tabularViewId, fileId, input.data);

    return { 
      statusCode: 200, 
      body: JSON.stringify({ extraction: updatedExtraction }), 
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
