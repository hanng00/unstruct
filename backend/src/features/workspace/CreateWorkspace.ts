import { created, internalServerError, unauthorized } from "@/utils/response";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import { getUserFromEvent } from "../auth";
import { WorkspaceService } from "./services/workspace-service";

const RequestSchema = z.object({
  name: z.string().min(1),
  dataModelId: z.string().min(1),
});

const service = new WorkspaceService();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const body = JSON.parse(event.body || "{}");
    const input = RequestSchema.parse(body);

    const ws = await service.create({
      userId: user.id,
      name: input.name,
      dataModelId: input.dataModelId,
    });

    return created({ workspace: ws });
  } catch (e: any) {
    return internalServerError(e);
  }
};
