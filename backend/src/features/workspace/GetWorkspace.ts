import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { withCors } from "../../utils/cors";
import { notFound, unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { WorkspaceService } from "./services/workspace-service";

const service = new WorkspaceService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const id = event.pathParameters?.id as string;
    const ws = await service.get(id);
    if (!ws || ws.userId !== user.id) return notFound();

    return { statusCode: 200, body: JSON.stringify({ workspace: ws }), headers: withCors({ "Content-Type": "application/json" }) };
  } catch (e: any) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }), headers: withCors({ "Content-Type": "application/json" }) };
  }
};


