import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand, DeleteCommand, DynamoDBDocumentClient, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getEnvOrThrow } from "../../../utils/env";
import { DDBFileRepository } from "../../files/repositories/file-repository";
import { Workspace, WorkspaceSchema } from "../models/workspace";

const tableName = getEnvOrThrow("DYNAMODB_TABLE");
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}), { marshallOptions: { removeUndefinedValues: true } });

export class WorkspaceRepository {
  constructor(private client: DynamoDBDocumentClient = ddb) {}

  async create(workspace: Workspace) {
    const w = WorkspaceSchema.parse(workspace);
    await this.client.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: [
            { PutRequest: { Item: { PK: `WS#${w.id}`, SK: `META#`, wsData: w, userId: w.userId } } },
            { PutRequest: { Item: { PK: `USER#${w.userId}`, SK: `WS#${w.id}`, wsId: w.id, wsData: w } } },
          ],
        },
      })
    );
    return { success: true } as const;
  }

  async get(workspaceId: string) {
    const res = await this.client.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "PK = :pk AND SK = :sk",
        ExpressionAttributeValues: { ":pk": `WS#${workspaceId}`, ":sk": "META#" },
      })
    );
    const item = res.Items?.[0];
    if (!item) return { success: false, error: "Not found" } as const;
    return { success: true, workspace: item.wsData as Workspace } as const;
  }

  async listByUser(userId: string) {
    const res = await this.client.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: { ":pk": `USER#${userId}`, ":sk": "WS#" },
      })
    );
    const workspaces = (res.Items || []).map((i) => i.wsData as Workspace);
    return { success: true, workspaces } as const;
  }

  async update(workspaceId: string, updates: Partial<Pick<Workspace, "name" | "dataModelId" | "updatedAt">>) {
    const names: Record<string, string> = { "#wsData": "wsData" };
    const values: Record<string, any> = {};
    const sets: string[] = [];
    if (typeof updates.name !== "undefined") {
      names["#name"] = "name";
      sets.push("#wsData.#name = :name");
      values[":name"] = updates.name;
    }
    if (typeof updates.dataModelId !== "undefined") {
      names["#dataModelId"] = "dataModelId";
      sets.push("#wsData.#dataModelId = :dataModelId");
      values[":dataModelId"] = updates.dataModelId;
    }
    if (typeof updates.updatedAt !== "undefined") {
      names["#updatedAt"] = "updatedAt";
      sets.push("#wsData.#updatedAt = :updatedAt");
      values[":updatedAt"] = updates.updatedAt;
    }
    if (sets.length === 0) return { success: true } as const;

    await this.client.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { PK: `WS#${workspaceId}`, SK: "META#" },
        UpdateExpression: `SET ${sets.join(", ")}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
      })
    );
    return { success: true } as const;
  }

  async addFilesToWorkspace(userId: string, workspaceId: string, fileIds: string[]) {
    const fileRepo = new DDBFileRepository();
    const files: any[] = [];
    for (const fileId of fileIds) {
      const res = await fileRepo.getFile(userId, fileId);
      if (res.success && res.file) {
        files.push(res.file);
      }
    }
    if (files.length === 0) return { success: true } as const;

    const nowIso = new Date().toISOString();
    const requests = files.map((file) => ({
      PutRequest: {
        Item: {
          PK: `WS#${workspaceId}`,
          SK: `FILE#${file.id}`,
          fileId: file.id,
          fileData: file,
          createdAt: nowIso,
        },
      },
    }));
    const chunks: typeof requests[] = [];
    for (let i = 0; i < requests.length; i += 25) chunks.push(requests.slice(i, i + 25));
    for (const chunk of chunks) {
      await this.client.send(new BatchWriteCommand({ RequestItems: { [tableName]: chunk } }));
    }
    return { success: true } as const;
  }

  async listWorkspaceFiles(workspaceId: string, limit = 50, startKey?: Record<string, unknown>) {
    const res = await this.client.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: { ":pk": `WS#${workspaceId}`, ":sk": "FILE#" },
        Limit: limit,
        ExclusiveStartKey: startKey,
        ScanIndexForward: false,
      })
    );
    const files = (res.Items || []).map((i) => i.fileData);
    return { success: true, files, lastEvaluatedKey: res.LastEvaluatedKey } as const;
  }

  async removeFileFromWorkspace(workspaceId: string, fileId: string) {
    await this.client.send(
      new DeleteCommand({
        TableName: tableName,
        Key: { PK: `WS#${workspaceId}`, SK: `FILE#${fileId}` },
      })
    );
    return { success: true } as const;
  }
}


