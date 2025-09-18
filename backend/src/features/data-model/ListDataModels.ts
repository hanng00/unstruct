import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { withCors } from "../../utils/cors";
import { unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { DataModelRepository } from "./repositories/data-model-repository";

const repo = new DataModelRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const dataModels = await repo.listDataModels(user.id);

    return { 
      statusCode: 200, 
      body: JSON.stringify({ dataModels }), 
      headers: withCors({ "Content-Type": "application/json" }) 
    };
  } catch (e: any) {
    return { 
      statusCode: 400, 
      body: JSON.stringify({ error: e.message }), 
      headers: withCors({ "Content-Type": "application/json" }) 
    };
  }
};