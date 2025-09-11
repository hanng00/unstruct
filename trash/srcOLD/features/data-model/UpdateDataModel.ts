import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import { withCors } from "../../utils/cors";
import { unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { DataModelRepository } from "./repositories/data-model-repository";

const UpdateDataModelSchema = z.object({
  schemaJson: z.unknown(),
});

const repo = new DataModelRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const dataModelId = event.pathParameters?.id;
    if (!dataModelId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Data model ID is required" }),
        headers: withCors({ "Content-Type": "application/json" })
      };
    }

    const body = JSON.parse(event.body || "{}");
    const input = UpdateDataModelSchema.parse(body);

    // Get existing data model
    const existingDataModel = await repo.getDataModel(dataModelId);
    if (!existingDataModel) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Data model not found" }),
        headers: withCors({ "Content-Type": "application/json" })
      };
    }

    // Check if user owns the data model
    if (existingDataModel.userId !== user.id) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Access denied" }),
        headers: withCors({ "Content-Type": "application/json" })
      };
    }

    // Update the data model
    const updatedDataModel = await repo.updateDataModel(dataModelId, {
      schemaJson: input.schemaJson,
      version: existingDataModel.version + 1,
    });

    return { 
      statusCode: 200, 
      body: JSON.stringify({ dataModel: updatedDataModel }), 
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
