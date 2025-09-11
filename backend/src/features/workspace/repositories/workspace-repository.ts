import { UnstructRepository } from "@/repositories/unstruct-repository";
import { Workspace, CreateWorkspace } from "@/features/workspace/models/workspace";

export class WorkspaceRepository extends UnstructRepository {
  async createWorkspace(input: CreateWorkspace & { id: string; userId: string }): Promise<Workspace> {
    const workspace: Workspace = {
      id: input.id,
      userId: input.userId,
      name: input.name,
      description: input.description,
      defaultSchemaId: input.defaultSchemaId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await this.create("WORKSPACE", workspace, {
      GSI3PK: `WS#${workspace.id}`,
      GSI3SK: `WS#${workspace.id}`,
    });
  }

  async getWorkspace(id: string): Promise<Workspace | null> {
    return await this.get<Workspace>("WORKSPACE", id);
  }

  async getWorkspacesByUser(userId: string): Promise<Workspace[]> {
    return await this.queryByUser<Workspace>(userId, "WORKSPACE");
  }

  async updateWorkspace(id: string, updates: Partial<Workspace>): Promise<Workspace | null> {
    return await this.update<Workspace>("WORKSPACE", id, updates);
  }

  async deleteWorkspace(id: string): Promise<void> {
    return await this.delete("WORKSPACE", id);
  }
}
