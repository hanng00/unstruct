import { CreateRecord, Record, UpdateRecord } from "@/features/extraction/models/record";
import { UnstructRepository } from "@/repositories/unstruct-repository";
import { DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

export class RecordRepository extends UnstructRepository {
  async createRecordEntity(input: CreateRecord & { id: string }): Promise<Record> {
    const record: Record = {
      id: input.id,
      extractionId: input.extractionId,
      rowIndex: input.rowIndex,
      data: input.data,
      status: "pending",
    };

    return await super.createRecord<Record>(input.extractionId, input.id, record);
  }

  async getRecordsByExtraction(extractionId: string): Promise<Record[]> {
    return await this.getRecords<Record>(extractionId);
  }

  async getRecord(extractionId: string, recordId: string): Promise<Record | null> {
    const result = await this.client.send(new GetCommand({
      TableName: this.tableName,
      Key: {
        PK: `EXTRACTION#${extractionId}`,
        SK: `RECORD#${recordId}`,
      },
    }));

    return result.Item?.data as Record || null;
  }

  async updateRecordEntity(extractionId: string, recordId: string, updates: UpdateRecord & { approvedBy?: string }): Promise<Record | null> {
    const updateData: Partial<Record> = { ...updates };
    
    if (updates.status === "approved") {
      updateData.approvedAt = new Date().toISOString();
    }

    return await super.updateRecord<Record>(extractionId, recordId, updateData);
  }

  async bulkUpdateRecordStatus(extractionId: string, recordIds: string[], status: Record["status"], approvedBy?: string): Promise<void> {
    const promises = recordIds.map(recordId => 
      this.updateRecord(extractionId, recordId, { status, approvedBy })
    );
    
    await Promise.all(promises);
  }

  async deleteRecord(extractionId: string, recordId: string): Promise<void> {
    await this.client.send(new DeleteCommand({
      TableName: this.tableName,
      Key: {
        PK: `EXTRACTION#${extractionId}`,
        SK: `RECORD#${recordId}`,
      },
    }));
  }
}
