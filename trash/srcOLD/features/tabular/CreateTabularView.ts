import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { withCors } from "../../utils/cors";
import { unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { TabularRepository } from "./repositories/tabular-repository";

const RequestSchema = z.object({
  name: z.string().min(1),
  dataModelId: z.string().optional(), // Optional reference to data model
});

const repo = new TabularRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const body = JSON.parse(event.body || "{}");
    const input = RequestSchema.parse(body);

    const tv = {
      id: uuid(),
      userId: user.id,
      name: input.name,
      createdAt: new Date().toISOString(),
      dataModelId: input.dataModelId,
    };

    await repo.createView(tv);

    return { statusCode: 201, body: JSON.stringify({ tv }), headers: withCors({ "Content-Type": "application/json" }) };
  } catch (e: any) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }), headers: withCors({ "Content-Type": "application/json" }) };
  }
};


