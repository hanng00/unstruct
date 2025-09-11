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
    const res = await repo.getView(tabularViewId);
    if (!res.success) return { statusCode: 404, body: JSON.stringify({ error: res.error }), headers: withCors({ "Content-Type": "application/json" }) };
    // Optional: verify ownership
    if (res.view.userId !== user.id) return unauthorized();
    return { statusCode: 200, body: JSON.stringify({ tv: res.view }), headers: withCors({ "Content-Type": "application/json" }) };
  } catch (e: any) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }), headers: withCors({ "Content-Type": "application/json" }) };
  }
};


