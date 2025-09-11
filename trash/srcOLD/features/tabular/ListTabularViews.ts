import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { withCors } from "../../utils/cors";
import { unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { TabularRepository } from "./repositories/tabular-repository";

const repo = new TabularRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const res = await repo.listViews(user.id);
    return { statusCode: 200, body: JSON.stringify({ views: res.views }), headers: withCors({ "Content-Type": "application/json" }) };
  } catch (e: any) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }), headers: withCors({ "Content-Type": "application/json" }) };
  }
};


