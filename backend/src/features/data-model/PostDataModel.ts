import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import { withCors } from "../../utils/cors";
import { unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { DataModelSchemaJsonSchema } from "./models/data-model";
import { DataModelRepository } from "./repositories/data-model-repository";

const RequestSchema = z.object({
  name: z.string(),
  schemaJson: DataModelSchemaJsonSchema,
});

const repo = new DataModelRepository();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const body = JSON.parse(event.body || "{}");
    const input = RequestSchema.parse(body);

    const dataModel = await repo.createDataModel({
      ...input,
      userId: user.id,
    });

    return {
      statusCode: 201,
      body: JSON.stringify({ dataModel }),
      headers: withCors({ "Content-Type": "application/json" }),
    };
  } catch (e: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
      headers: withCors({ "Content-Type": "application/json" }),
    };
  }
};
