import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  internalServerError,
  success,
  unauthorized
} from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { WorkspaceRepository } from "./repositories/workspace-repository";

const repo = new WorkspaceRepository();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const id = event.pathParameters?.id as string;
    const limit = event.queryStringParameters?.limit
      ? Number(event.queryStringParameters.limit)
      : 50;
    const filesRes = await repo.listWorkspaceFiles(id, limit);

    return success(filesRes);
  } catch (e: any) {
    return internalServerError(e.message);
  }
};
