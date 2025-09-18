import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import { withCors } from "../../utils/cors";
import { unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { WorkspaceRepository } from "./repositories/workspace-repository";

const RequestSchema = z.object({ fileIds: z.array(z.string().min(1)).min(1) });
const repo = new WorkspaceRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const id = event.pathParameters?.id as string;
    const body = JSON.parse(event.body || "{}");
    const input = RequestSchema.parse(body);

    await repo.addFilesToWorkspace(user.id, id, input.fileIds);

    return { statusCode: 200, body: JSON.stringify({ success: true }), headers: withCors({ "Content-Type": "application/json" }) };
  } catch (e: any) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }), headers: withCors({ "Content-Type": "application/json" }) };
  }
};


