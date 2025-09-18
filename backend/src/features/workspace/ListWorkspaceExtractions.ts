import { withCors } from "@/utils/cors";
import { notFound, unauthorized } from "@/utils/response";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getUserFromEvent } from "../auth";
import { DDBExtractionRepository } from "../extractions/repositories/extraction-repository";
import { WorkspaceRepository } from "./repositories/workspace-repository";

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
    if (!wsRes.success || wsRes.workspace.userId !== user.id)
      return notFound(`Workspace not found`);

    const workspace = wsRes.workspace;
    const filesRes = await wsRepo.listWorkspaceFiles(id, 100);
    const files = filesRes.files || [];

    const rows = await Promise.all(
      files.map(async (file: any) => {
        const extractions = await extRepo.getExtractionsByFile(file.id);
        const forModel = extractions.filter(
          (e) => e.dataModelId === workspace.dataModelId
        );
        const latest =
          forModel.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0] || null;
        return { fileId: file.id, file, extraction: latest };
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ rows }),
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
