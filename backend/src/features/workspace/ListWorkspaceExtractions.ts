import {
  internalServerError,
  notFound,
  success,
  unauthorized,
} from "@/utils/response";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import { getUserFromEvent } from "../auth";
import {
  ExtractionRecordSchema,
  ExtractionSchema,
} from "../extractions/models/extraction";
import { DDBExtractionRepository } from "../extractions/repositories/extraction-repository";
import { FileReferenceSchema } from "../files/models/file-reference";
import { WorkspaceRepository } from "./repositories/workspace-repository";

const wsRepo = new WorkspaceRepository();
const extRepo = new DDBExtractionRepository();

const ResponseSchema = z
  .object({
    fileId: z.string(),
    file: FileReferenceSchema,
    extraction: ExtractionSchema.nullable(),
    records: ExtractionRecordSchema.array(),
  })
  .array();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const id = event.pathParameters?.id as string;

    const wsRes = await wsRepo.get(id);
    if (!wsRes.success) return notFound("Workspace not found");

    if (wsRes.workspace.userId !== user.id) return unauthorized();

    // List files in workspace
    const workspace = wsRes.workspace;
    const filesRes = await wsRepo.listWorkspaceFiles(id, 100);
    const files = filesRes.files || [];

    // List extractions for each file - newest first
    const rows = await Promise.all(
      files.map(async (file) => {
        const extractions = await extRepo.getExtractionsByFile(file.id);
        const latest =
          extractions
            .filter((e) => e.dataModelId === workspace.dataModelId)
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            )[0] || null;

        const records = latest
          ? await extRepo.getExtractionRecords(latest.id)
          : [];

        return { fileId: file.id, file, extraction: latest, records };
      })
    );

    console.log(
      "Attempting to validate response",
      JSON.stringify(rows, null, 2)
    );

    const validatedResponse = ResponseSchema.parse(rows);
    return success({ rows: validatedResponse });
  } catch (e: any) {
    return internalServerError(e);
  }
};
