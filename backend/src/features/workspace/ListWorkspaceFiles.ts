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
    const limit = event.queryStringParameters?.limit ? Number(event.queryStringParameters.limit) : 50;
    const filesRes = await repo.listWorkspaceFiles(id, limit);

    return { statusCode: 200, body: JSON.stringify(filesRes), headers: withCors({ "Content-Type": "application/json" }) };
  } catch (e: any) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }), headers: withCors({ "Content-Type": "application/json" }) };
  }
};


