import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand, DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { getEnvOrThrow } from "../../../utils/env";
import { CreateDataModel, DataModel } from "../models/data-model";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export class DataModelRepository {
  private readonly tableName = getEnvOrThrow("DYNAMODB_TABLE");

  async createDataModel(input: CreateDataModel & { userId: string }): Promise<DataModel> {
    const now = new Date().toISOString();
    const dataModel: DataModel = {
      id: crypto.randomUUID(),
      userId: input.userId,
      name: input.name,
      version: 1,
      schemaJson: input.schemaJson,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [this.tableName]: [
            { PutRequest: { Item: { PK: `DM#${dataModel.id}`, SK: `META#`, userId: input.userId, dmData: dataModel } } },
            { PutRequest: { Item: { PK: `USER#${input.userId}`, SK: `DM#${dataModel.id}`, dmId: dataModel.id, dmData: dataModel } } },
          ],
        },
      })
    );

    return dataModel;
  }

  async getDataModel(id: string): Promise<DataModel | null> {
    const result = await docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "PK = :pk AND SK = :sk",
        ExpressionAttributeValues: {
          ":pk": `DM#${id}`,
          ":sk": `META#`,
        },
      })
    );

    const item = result.Items?.[0];
    return item?.dmData as DataModel | null;
  }

  async updateDataModel(id: string, updates: { schemaJson: unknown; version: number }): Promise<DataModel> {
    const now = new Date().toISOString();
    
    // First get the existing data model
    const existingDataModel = await this.getDataModel(id);
    if (!existingDataModel) {
      throw new Error("Data model not found");
    }

    const updatedDataModel: DataModel = {
      ...existingDataModel,
      ...updates,
      updatedAt: now,
    };

    // Update both records
    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [this.tableName]: [
            { PutRequest: { Item: { PK: `DM#${id}`, SK: `META#`, userId: existingDataModel.userId, dmData: updatedDataModel } } },
            { PutRequest: { Item: { PK: `USER#${existingDataModel.userId}`, SK: `DM#${id}`, dmId: id, dmData: updatedDataModel } } },
          ],
        },
      })
    );

    return updatedDataModel;
  }

  async listDataModels(userId: string): Promise<DataModel[]> {
    const result = await docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":sk": "DM#",
        },
      })
    );

    return (result.Items || []).map(item => item.dmData as DataModel);
  }
}
