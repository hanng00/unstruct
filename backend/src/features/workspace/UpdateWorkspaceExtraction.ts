import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import { withCors } from "../../utils/cors";
import { notFound, success, unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { DDBExtractionRepository } from "../extractions/repositories/extraction-repository";
import { WorkspaceRepository } from "./repositories/workspace-repository";

const RequestSchema = z.object({
  approve: z.boolean().optional(),
  overrides: z.record(z.string(), z.unknown()).optional(),
});

const wsRepo = new WorkspaceRepository();
const extRepo = new DDBExtractionRepository();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const id = event.pathParameters?.id as string; // workspace id
    const fileId = event.pathParameters?.fileId as string;

    const wsRes = await wsRepo.get(id);
    if (!wsRes.success || wsRes.workspace.userId !== user.id) {
      return notFound("Workspace not found");
    }
    const workspace = wsRes.workspace;

    const body = JSON.parse(event.body || "{}");
    const input = RequestSchema.parse(body);

    // latest extraction for file+model
    const extractions = await extRepo.getExtractionsByFile(fileId);
    const forModel = extractions.filter(
      (e) => e.dataModelId === workspace.dataModelId
    );
    const latest =
      forModel.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0] || null;
    if (!latest) {
      return notFound("Extraction not found");
    }

    const updated = await extRepo.updateExtraction(latest.id, {
      overrides: input.overrides
        ? { ...(latest.overrides || {}), ...input.overrides }
        : latest.overrides,
      approved:
        typeof input.approve === "boolean" ? input.approve : latest.approved,
      updatedAt: new Date().toISOString(),
    } as any);

    return success({ extraction: updated });
  } catch (e: any) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: e.message }),
      headers: withCors({ "Content-Type": "application/json" }),
    };
  }
};
