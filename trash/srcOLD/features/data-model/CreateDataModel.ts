import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { withCors } from "../../utils/cors";
import { unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { CreateDataModelSchema } from "./models/data-model";
import { DataModelRepository } from "./repositories/data-model-repository";

const RequestSchema = CreateDataModelSchema;

const repo = new DataModelRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
