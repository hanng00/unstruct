import { IExtractionRepository } from "@/features/extractions/repositories/extraction-repository";
import { StructuredDataExtractor } from "./extractor";

export class RunExtractionUseCase {
  constructor(
    private readonly extractionRepository: IExtractionRepository,
    private readonly basicExtractor: StructuredDataExtractor,
    private readonly pivotedExtractor: StructuredDataExtractor
  ) {}

  async execute(extractionId: string): Promise<void> {
    const extraction = await this.extractionRepository.getExtraction(extractionId);
    if (!extraction) return;

    const transitioned = await this.extractionRepository.tryTransition(
      extractionId,
      "queued",
      "processing"
    );
    if (!transitioned) return;

    try {
      const extractor = extraction.pivotOn
        ? this.pivotedExtractor
        : this.basicExtractor;

      const data = await extractor.extract(
        extraction.userId,
        extraction.fileId,
        extraction.dataModelId,
        extraction.pivotOn
      );
      console.log("data", data);

      await this.extractionRepository.finish(extractionId, {
        status: "completed",
        data,
      });
    } catch (e) {
      await this.extractionRepository.finish(extractionId, {
        status: "failed",
      });
      throw e;
    }
  }
}


