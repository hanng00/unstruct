import { CreateSynthesisJob, SynthesisJob } from "@/features/product/models/synthesis-job";
import { UnstructRepository } from "@/repositories/unstruct-repository";

export class SynthesisJobRepository extends UnstructRepository {
  async createSynthesisJob(input: CreateSynthesisJob & { id: string; userId: string }): Promise<SynthesisJob> {
    const synthesisJob: SynthesisJob = {
      id: input.id,
      userId: input.userId,
      workspaceId: input.workspaceId,
      name: input.name,
      status: "queued",
      extractionIds: input.extractionIds,
      schemaId: input.schemaId,
      synthesisMethod: input.synthesisMethod,
      configuration: input.configuration,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await this.create("SYNTHESIS_JOB", synthesisJob, {
      GSI2PK: `SYNTHESIS#queued`,
      GSI2SK: `SYNTHESIS#${synthesisJob.createdAt}`,
      GSI3PK: `WS#${input.workspaceId}`,
      GSI3SK: `SYNTHESIS#${synthesisJob.id}`,
    });
  }

  async getSynthesisJob(id: string): Promise<SynthesisJob | null> {
    return await this.get<SynthesisJob>("SYNTHESIS_JOB", id);
  }

  async getSynthesisJobsByUser(userId: string): Promise<SynthesisJob[]> {
    return await this.queryByUser<SynthesisJob>(userId, "SYNTHESIS_JOB");
  }

  async getSynthesisJobsByWorkspace(workspaceId: string): Promise<SynthesisJob[]> {
    return await this.queryByWorkspace<SynthesisJob>(workspaceId, "SYNTHESIS_JOB");
  }

  async updateSynthesisJobStatus(id: string, status: SynthesisJob["status"]): Promise<SynthesisJob | null> {
    return await this.update<SynthesisJob>("SYNTHESIS_JOB", id, { status });
  }

  async updateSynthesisJobResult(id: string, result: SynthesisJob["result"]): Promise<SynthesisJob | null> {
    return await this.update<SynthesisJob>("SYNTHESIS_JOB", id, { result });
  }

  async deleteSynthesisJob(id: string): Promise<void> {
    return await this.delete("SYNTHESIS_JOB", id);
  }
}
