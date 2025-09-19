import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import {
  conflict,
  internalServerError,
  success,
  unauthorized
} from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { Field, FieldSchema } from "./models/field";
import { DataModelRepository } from "./repositories/data-model-repository";

const RequestSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  fields: FieldSchema.array(),
});

const repo = new DataModelRepository();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const body = JSON.parse(event.body || "{}");
    const validatedBody = RequestSchema.parse(body);

    // Validate the field id's are unique
    if (!hasUniqueFieldIds(validatedBody.fields))
      return conflict("Field id's must be unique");

    const dataModel = await repo.createDataModel({
      ...validatedBody,
      userId: user.id,
    });

    return success({ dataModel });
  } catch (e: any) {
    return internalServerError(e);
  }
};

const hasUniqueFieldIds = (fields: Field[]) => {
  const uniqueFieldIds = new Set(fields.map((f) => f.id));
  return uniqueFieldIds.size === fields.length;
};
