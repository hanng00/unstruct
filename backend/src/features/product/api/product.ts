import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ProductRepository } from "@/features/product/repositories/product-repository";
import { CreateProductSchema } from "@/features/product/models/product";
import { createResponse } from "@/utils/response";
import { corsHeaders } from "@/utils/cors";

const productRepository = new ProductRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (event.httpMethod === "POST") {
      return await createProduct(event);
    }
    
    if (event.httpMethod === "GET") {
      return await getProduct(event);
    }

    if (event.httpMethod === "PUT") {
      return await updateProduct(event);
    }

    if (event.httpMethod === "DELETE") {
      return await deleteProduct(event);
    }

    return createResponse(405, { error: "Method not allowed" }, corsHeaders);
  } catch (error) {
    console.error("Product handler error:", error);
    return createResponse(500, { error: "Internal server error" }, corsHeaders);
  }
};

async function createProduct(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body || "{}");
  const validatedInput = CreateProductSchema.parse(body);
  
  const productId = crypto.randomUUID();
  const userId = event.requestContext.authorizer?.userId || "anonymous";
  
  const product = await productRepository.createProduct({
    id: productId,
    userId,
    ...validatedInput,
  });

  return createResponse(201, product, corsHeaders);
}

async function getProduct(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const productId = event.pathParameters?.productId;
  if (!productId) {
    return createResponse(400, { error: "Product ID is required" }, corsHeaders);
  }

  const product = await productRepository.getProduct(productId);
  if (!product) {
    return createResponse(404, { error: "Product not found" }, corsHeaders);
  }

  return createResponse(200, product, corsHeaders);
}

async function updateProduct(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const productId = event.pathParameters?.productId;
  if (!productId) {
    return createResponse(400, { error: "Product ID is required" }, corsHeaders);
  }

  const body = JSON.parse(event.body || "{}");
  const product = await productRepository.updateProduct(productId, body);
  
  if (!product) {
    return createResponse(404, { error: "Product not found" }, corsHeaders);
  }

  return createResponse(200, product, corsHeaders);
}

async function deleteProduct(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const productId = event.pathParameters?.productId;
  if (!productId) {
    return createResponse(400, { error: "Product ID is required" }, corsHeaders);
  }

  await productRepository.deleteProduct(productId);
  return createResponse(204, {}, corsHeaders);
}
