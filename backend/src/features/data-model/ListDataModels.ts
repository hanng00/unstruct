import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  internalServerError,
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

    const dataModels = await repo.listDataModels(user.id);

    return success({ dataModels });
  } catch (e: any) {
    return internalServerError(e);
  }
};
