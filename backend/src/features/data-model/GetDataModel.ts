import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { withCors } from "../../utils/cors";
import { unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { DataModelRepository } from "./repositories/data-model-repository";

const repo = new DataModelRepository();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const dataModelId = event.pathParameters?.id;
    if (!dataModelId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Data model ID is required" }),
        headers: withCors({ "Content-Type": "application/json" }),
      };
    }

    const dataModel = await repo.getDataModel(user.id, dataModelId);
    if (!dataModel) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Data model not found" }),
        headers: withCors({ "Content-Type": "application/json" }),
      };
    }

    // Check if user owns the data model
    if (dataModel.userId !== user.id) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Access denied" }),
        headers: withCors({ "Content-Type": "application/json" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ dataModel }),
      headers: withCors({ "Content-Type": "application/json" }),
    };
  } catch (e: any) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: e.message }),
      headers: withCors({ "Content-Type": "application/json" }),
    };
  }
};
