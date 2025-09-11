import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ProductRepository } from "@/features/product/repositories/product-repository";
import { createResponse } from "@/utils/response";
import { corsHeaders } from "@/utils/cors";

const productRepository = new ProductRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const workspaceId = event.pathParameters?.workspaceId;
    if (!workspaceId) {
      return createResponse(400, { error: "Workspace ID is required" }, corsHeaders);
    }

    const products = await productRepository.getProductsByWorkspace(workspaceId);
    return createResponse(200, { products }, corsHeaders);
  } catch (error) {
    console.error("List products handler error:", error);
    return createResponse(500, { error: "Internal server error" }, corsHeaders);
  }
};
