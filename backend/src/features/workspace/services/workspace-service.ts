import { v4 as uuid } from "uuid";
import { Workspace } from "../models/workspace";
import { WorkspaceRepository } from "../repositories/workspace-repository";

export class WorkspaceService {
  constructor(private readonly repo: WorkspaceRepository = new WorkspaceRepository()) {}

  async create(params: { userId: string; name: string; dataModelId: string }) {
    const now = new Date().toISOString();
    const workspace: Workspace = {
      id: uuid(),
      userId: params.userId,
      name: params.name,
      dataModelId: params.dataModelId,
      createdAt: now,
      updatedAt: now,
    };
    await this.repo.create(workspace);
    return workspace;
  }

  async get(workspaceId: string) {
    const result = await this.repo.get(workspaceId);
    if (!result.success) return null;
    return result.workspace;
  }

  async list(userId: string) {
    const result = await this.repo.listByUser(userId);
    return result.workspaces;
  }

  async update(workspaceId: string, updates: Partial<Pick<Workspace, "name" | "dataModelId">>) {
    await this.repo.update(workspaceId, updates);
    const result = await this.repo.get(workspaceId);
    if (!result.success) return null;
    return result.workspace;
  }
}


