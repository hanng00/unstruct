import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { withCors } from "../../utils/cors";
import { badRequest, unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { TabularRepository } from "./repositories/tabular-repository";

const repo = new TabularRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();
    const tabularViewId = event.pathParameters?.tabularViewId;
    if (!tabularViewId) return badRequest("'tabularViewId' is required");
    const limit = Number(event.queryStringParameters?.limit || 50);
    const cursor = event.queryStringParameters?.cursor ? JSON.parse(Buffer.from(event.queryStringParameters.cursor, "base64").toString("utf-8")) : undefined;
    const res = await repo.listExtractions(tabularViewId, limit, cursor);
    const nextCursor = res.lastEvaluatedKey ? Buffer.from(JSON.stringify(res.lastEvaluatedKey)).toString("base64") : undefined;
    return { statusCode: 200, body: JSON.stringify({ extractions: res.extractions, cursor: nextCursor }), headers: withCors({ "Content-Type": "application/json" }) };
  } catch (e: any) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }), headers: withCors({ "Content-Type": "application/json" }) };
  }
};


