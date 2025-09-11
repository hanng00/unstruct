import { CreateExtraction, Extraction } from "@/features/extraction/models/extraction";
import { UnstructRepository } from "@/repositories/unstruct-repository";
import { QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

export class ExtractionRepository extends UnstructRepository {
  async createExtraction(input: CreateExtraction & { id: string; userId: string }): Promise<Extraction> {
    const extraction: Extraction = {
      id: input.id,
      workspaceId: input.workspaceId,
      fileId: input.fileId,
      schemaId: input.schemaId,
      userId: input.userId,
      status: "queued",
      recordCount: 0,
      approvedRecordCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await this.create("EXTRACTION", extraction, {
      GSI1PK: `WS#${input.workspaceId}`,
      GSI1SK: `EXTRACTION#${extraction.id}`,
      GSI2PK: `EXTRACTION#queued`,
      GSI2SK: `EXTRACTION#${extraction.createdAt}`,
      GSI3PK: `FILE#${input.fileId}`,
      GSI3SK: `EXTRACTION#${extraction.id}`,
    });
  }

  async getExtraction(id: string): Promise<Extraction | null> {
    return await this.get<Extraction>("EXTRACTION", id);
  }

  async getExtractionsByWorkspace(workspaceId: string): Promise<Extraction[]> {
    return await this.queryByWorkspace<Extraction>(workspaceId, "EXTRACTION");
  }

  async getExtractionsByFile(fileId: string): Promise<Extraction[]> {
    const result = await this.client.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: "GSI3",
      KeyConditionExpression: "GSI3PK = :pk AND begins_with(GSI3SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `FILE#${fileId}`,
        ":sk": "EXTRACTION#",
      },
    }));

    return (result.Items || []).map(item => item.data as Extraction);
  }

  async getExtractionsBySchema(schemaId: string): Promise<Extraction[]> {
    const result = await this.client.send(new ScanCommand({
      TableName: this.tableName,
      FilterExpression: "contains(#data, :schemaId)",
      ExpressionAttributeNames: {
        "#data": "data",
      },
      ExpressionAttributeValues: {
        ":schemaId": schemaId,
      },
    }));

    return (result.Items || [])
      .filter(item => item.entityType === "EXTRACTION")
      .map(item => item.data as Extraction);
  }

  async updateExtractionStatus(id: string, status: Extraction["status"], errorMessage?: string): Promise<Extraction | null> {
    const updates: Partial<Extraction> = { status };
    if (errorMessage) updates.errorMessage = errorMessage;
    
    return await this.update<Extraction>("EXTRACTION", id, updates);
  }

  async updateExtractionCounts(id: string, recordCount: number, approvedRecordCount: number): Promise<Extraction | null> {
    return await this.update<Extraction>("EXTRACTION", id, { recordCount, approvedRecordCount });
  }

  async deleteExtraction(id: string): Promise<void> {
    return await this.delete("EXTRACTION", id);
  }
}
