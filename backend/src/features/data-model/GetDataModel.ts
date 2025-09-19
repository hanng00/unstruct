import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  badRequest,
  forbidden,
  internalServerError,
  notFound,
  success,
  unauthorized,
} from "../../utils/response";
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
    if (!dataModelId) return badRequest("Data model ID is required");

    const dataModel = await repo.getDataModel(user.id, dataModelId);
    if (!dataModel) return notFound("Data model not found");

    // Check if user owns the data model
    if (dataModel.userId !== user.id)
      return forbidden("You are not authorized to access this data model");

    return success({ dataModel });
  } catch (e: any) {
    return internalServerError(e);
  }
};
