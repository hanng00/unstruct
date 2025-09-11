import { UnstructRepository } from "@/repositories/unstruct-repository";
import { Schema, CreateSchema } from "@/features/schema/models/schema";

export class SchemaRepository extends UnstructRepository {
  async createSchema(input: CreateSchema & { id: string; userId: string }): Promise<Schema> {
    const schema: Schema = {
      id: input.id,
      userId: input.userId,
      name: input.name,
      version: 1,
      definition: input.definition,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await this.create("SCHEMA", schema, {
      GSI2PK: `SCHEMA#1`,
      GSI2SK: `SCHEMA#${schema.createdAt}`,
    });
  }

  async getSchema(id: string): Promise<Schema | null> {
    return await this.get<Schema>("SCHEMA", id);
  }

  async getSchemasByUser(userId: string): Promise<Schema[]> {
    return await this.queryByUser<Schema>(userId, "SCHEMA");
  }

  async updateSchema(id: string, updates: Partial<Schema>): Promise<Schema | null> {
    return await this.update<Schema>("SCHEMA", id, updates);
  }

  async deleteSchema(id: string): Promise<void> {
    return await this.delete("SCHEMA", id);
  }
}
