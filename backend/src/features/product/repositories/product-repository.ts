import { UnstructRepository } from "@/repositories/unstruct-repository";
import { Product, CreateProduct } from "@/features/product/models/product";

export class ProductRepository extends UnstructRepository {
  async createProduct(input: CreateProduct & { id: string; userId: string }): Promise<Product> {
    const product: Product = {
      id: input.id,
      userId: input.userId,
      workspaceId: input.workspaceId,
      name: input.name,
      description: input.description,
      status: "draft",
      synthesizedData: {},
      sourceExtractionIds: input.sourceExtractionIds,
      synthesisJobId: input.synthesisJobId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await this.create("PRODUCT", product, {
      GSI2PK: `PRODUCT#draft`,
      GSI2SK: `PRODUCT#${product.createdAt}`,
      GSI3PK: `WS#${input.workspaceId}`,
      GSI3SK: `PRODUCT#${product.id}`,
    });
  }

  async getProduct(id: string): Promise<Product | null> {
    return await this.get<Product>("PRODUCT", id);
  }

  async getProductsByUser(userId: string): Promise<Product[]> {
    return await this.queryByUser<Product>(userId, "PRODUCT");
  }

  async getProductsByWorkspace(workspaceId: string): Promise<Product[]> {
    return await this.queryByWorkspace<Product>(workspaceId, "PRODUCT");
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    return await this.update<Product>("PRODUCT", id, updates);
  }

  async updateProductStatus(id: string, status: Product["status"]): Promise<Product | null> {
    return await this.update<Product>("PRODUCT", id, { status });
  }

  async deleteProduct(id: string): Promise<void> {
    return await this.delete("PRODUCT", id);
  }
}
