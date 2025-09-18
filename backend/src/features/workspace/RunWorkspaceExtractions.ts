import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import { withCors } from "../../utils/cors";
import { unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { DDBExtractionRepository } from "../extractions/repositories/extraction-repository";
import { WorkspaceRepository } from "./repositories/workspace-repository";

const RequestSchema = z.object({
  fileIds: z.array(z.string().min(1)).min(1),
  pivotOn: z.string().optional(),
});
const wsRepo = new WorkspaceRepository();
const extRepo = new DDBExtractionRepository();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const id = event.pathParameters?.id as string;
    const wsRes = await wsRepo.get(id);
    if (!wsRes.success || wsRes.workspace.userId !== user.id) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Not found" }),
        headers: withCors({ "Content-Type": "application/json" }),
      };
    }
    const workspace = wsRes.workspace;

    const body = JSON.parse(event.body || "{}");
    const input = RequestSchema.parse(body);

    const created = await Promise.all(
      input.fileIds.map((fileId) =>
        extRepo.createExtraction(
          fileId,
          workspace.dataModelId,
          user.id,
          input.pivotOn
        )
      )
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ created }),
      headers: withCors({ "Content-Type": "application/json" }),
    };
  } catch (e: any) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: e.message }),
      headers: withCors({ "Content-Type": "application/json" }),
    };
  }
};
