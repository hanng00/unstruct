import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import {
  badRequest,
  forbidden,
  internalServerError,
  notFound,
  success,
  unauthorized,
} from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { Field, FieldSchema } from "./models/field";
import { DataModelRepository } from "./repositories/data-model-repository";

const UpdateDataModelSchema = z.object({
  fields: FieldSchema.array(), // Complete replace of existing fields
});

const repo = new DataModelRepository();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const dataModelId = event.pathParameters?.id;
    if (!dataModelId) return badRequest("Data model ID is required");

    const body = JSON.parse(event.body || "{}");
    const input = UpdateDataModelSchema.parse(body);

    // Get existing data model
    const existingDataModel = await repo.getDataModel(user.id, dataModelId);
    if (!existingDataModel) return notFound("Data model not found");

    // Check if user owns the data model
    if (existingDataModel.userId !== user.id) return forbidden("Access denied");

    // Validate the field id's are unique
    if (!hasUniqueFieldIds(input.fields))
      return badRequest("Field id's must be unique");

    // Update the data model
    const updatedDataModel = await repo.updateDataModel(user.id, dataModelId, {
      fields: input.fields,
      version: existingDataModel.version + 1,
    });

    return success({ dataModel: updatedDataModel });
  } catch (e: any) {
    return internalServerError(e);
  }
};

const hasUniqueFieldIds = (fields: Field[]) => {
  const uniqueFieldIds = new Set(fields.map((f) => f.id));
  return uniqueFieldIds.size === fields.length;
};
