import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { withCors } from "../../utils/cors";
import { unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { WorkspaceRepository } from "./repositories/workspace-repository";

const repo = new WorkspaceRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const id = event.pathParameters?.id as string;
    const fileId = event.pathParameters?.fileId as string;
    // Optional: verify ownership of workspace here if needed (get + compare userId)
    await repo.removeFileFromWorkspace(id, fileId);
    return { statusCode: 200, body: JSON.stringify({ success: true }), headers: withCors({ "Content-Type": "application/json" }) };
  } catch (e: any) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }), headers: withCors({ "Content-Type": "application/json" }) };
  }
};


