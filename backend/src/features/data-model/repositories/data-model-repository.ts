import { getEnvOrThrow } from "@/utils/env";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { type DataModel, type DataModelSchemaJson } from "../models/data-model";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
type CreateDataModel = { name: string; schemaJson: DataModelSchemaJson };

export interface IDataModelRepository {
  createDataModel: (
    input: CreateDataModel & { userId: string }
  ) => Promise<DataModel>;
  getDataModel: (userId: string, id: string) => Promise<DataModel | null>;
  updateDataModel: (
    userId: string,
    dataModelId: string,
    updates: Partial<DataModel>
  ) => Promise<DataModel>;
  listDataModels: (userId: string) => Promise<DataModel[]>;
}

export class DataModelRepository implements IDataModelRepository {
  private readonly tableName = getEnvOrThrow("DYNAMODB_TABLE");

  async createDataModel(
    input: CreateDataModel & { userId: string }
  ): Promise<DataModel> {
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
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `USER#${input.userId}`,
          SK: `DM#${dataModel.id}`,
          dmData: dataModel,
          createdAt: now,
          updatedAt: now,
        },
      })
    );

    return dataModel;
  }

  async getDataModel(userId: string, id: string): Promise<DataModel | null> {
    const result = await docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "PK = :pk AND SK = :sk",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":sk": `DM#${id}`,
        },
      })
    );

    const item = result.Items?.[0];
    return item?.dmData as DataModel | null;
  }

  async updateDataModel(
    userId: string,
    dataModelId: string,
    updates: Partial<DataModel>
  ): Promise<DataModel> {
    const now = new Date().toISOString();

    // First get the existing data model
    const existingDataModel = await this.getDataModel(userId, dataModelId);
    if (!existingDataModel) {
      throw new Error("Data model not found");
    }

    const updatedDataModel: DataModel = {
      ...existingDataModel,
      ...updates,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `USER#${userId}`,
          SK: `DM#${dataModelId}`,
          dmData: updatedDataModel,
          updatedAt: now,
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

    return (result.Items || []).map((item) => item.dmData as DataModel);
  }
}
