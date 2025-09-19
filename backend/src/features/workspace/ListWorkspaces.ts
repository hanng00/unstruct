import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  internalServerError,
  success,
  unauthorized,
} from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { WorkspaceService } from "./services/workspace-service";

const service = new WorkspaceService();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const workspaces = await service.list(user.id);

    return success({ workspaces });
  } catch (e: any) {
    return internalServerError(e.message);
  }
};
