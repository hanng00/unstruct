import {
  ConditionalCheckFailedException,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { getEnvOrThrow } from "../../../utils/env";
import { FileReference, FileReferenceSchema } from "../models/file-reference";

type Response = {
  success: boolean;
  error?: string;
};

export interface IFileRepository {
  initFile(userId: string, file: FileReference): Promise<Response>;
  updateFileStatus(
    userId: string,
    fileId: FileReference["id"],
    status: FileReference["status"]
  ): Promise<Response>;
  listFiles(
    userId: string
  ): Promise<{ success: boolean; files?: FileReference[]; error?: string }>;
  getFile(
    userId: string,
    fileId: string
  ): Promise<{ success: boolean; file?: FileReference; error?: string }>;
}

const tableName = getEnvOrThrow("DYNAMODB_TABLE");
const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export class DDBFileRepository implements IFileRepository {
  constructor(private dynamoDb: DynamoDBDocumentClient = ddbClient) {}

  async initFile(userId: string, file: FileReference): Promise<Response> {
    const validatedFile = FileReferenceSchema.parse(file);

    const command = new PutCommand({
      TableName: tableName,
      Item: {
        PK: `USER#${userId}`,
        SK: `FILE#${validatedFile.id}`,
        createdAt: validatedFile.createdAt,
        fileData: validatedFile,
      },
    });
    await this.dynamoDb.send(command);
    return { success: true };
  }

  async updateFileStatus(
    userId: string,
    fileId: FileReference["id"],
    status: FileReference["status"]
  ): Promise<Response> {
    try {
      const command = new UpdateCommand({
        TableName: tableName,
        Key: { PK: `USER#${userId}`, SK: `FILE#${fileId}` },
        UpdateExpression: "SET #fd.#status = :status",
        ExpressionAttributeNames: {
          "#fd": "fileData",
          "#status": "status",
        },
        ExpressionAttributeValues: { ":status": status },
        ConditionExpression: "attribute_exists(PK)",
      });
      await this.dynamoDb.send(command);

      return { success: true };
    } catch (error: unknown) {
      if (error instanceof ConditionalCheckFailedException) {
        return { success: false, error: "File not found" };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async listFiles(
    userId: string
  ): Promise<{ success: boolean; files?: FileReference[]; error?: string }> {
    try {
      const command = new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":sk": "FILE#",
        },
      });

      const result = await this.dynamoDb.send(command);

      const files =
        result.Items?.map((item) => item.fileData as FileReference) || [];

      return { success: true, files };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getFile(
    userId: string,
    fileId: string
  ): Promise<{ success: boolean; file?: FileReference; error?: string }> {
    try {
      const command = new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "PK = :pk AND SK = :sk",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":sk": `FILE#${fileId}`,
        },
        Limit: 1,
      });

      const result = await this.dynamoDb.send(command);
      const item = result.Items?.[0];
      if (!item) {
        return { success: false, error: "File not found" };
      }
      return { success: true, file: item.fileData as FileReference };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
