import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import { withCors } from "../../utils/cors";
import { unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { WorkspaceService } from "./services/workspace-service";

const RequestSchema = z.object({
  name: z.string().min(1).optional(),
  dataModelId: z.string().min(1).optional(),
});

const service = new WorkspaceService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const id = event.pathParameters?.id as string;
    const body = JSON.parse(event.body || "{}");
    const input = RequestSchema.parse(body);

    const ws = await service.get(id);
    if (!ws || ws.userId !== user.id) return { statusCode: 404, body: JSON.stringify({ error: "Not found" }), headers: withCors({ "Content-Type": "application/json" }) };

    const updated = await service.update(id, { name: input.name, dataModelId: input.dataModelId });

    return { statusCode: 200, body: JSON.stringify({ workspace: updated }), headers: withCors({ "Content-Type": "application/json" }) };
  } catch (e: any) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }), headers: withCors({ "Content-Type": "application/json" }) };
  }
};


