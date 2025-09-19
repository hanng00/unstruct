import { getEnvOrThrow } from "@/utils/env";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { DataModel } from "../models/data-model";
import { Field } from "../models/field";

type CreateDataModelNew = {
  name: string;
  userId: string;
  description?: string;
  fields: Field[];
};

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export interface IDataModelRepository {
  createDataModel: (input: CreateDataModelNew) => Promise<DataModel>;
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

  async createDataModel(params: CreateDataModelNew): Promise<DataModel> {
    const now = new Date().toISOString();
    const dataModel: DataModel = {
      id: crypto.randomUUID(),
      userId: params.userId,
      name: params.name,
      version: 1,
      fields: params.fields,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `USER#${params.userId}`,
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
