import { IDataModelRepository } from "@/features/data-model/repositories/data-model-repository";
import { schemaDefinitionToJsonSchema } from "@/features/data-model/services/field-to-jsonschema";
import { IExtractionRepository } from "@/features/extractions/repositories/extraction-repository";
import { withEvidence } from "../models/evidence";
import { FileLoader } from "./file-loader";
import { StructuredDataExtractor } from "./structured-data-extractor";

export class RunExtractionUseCase {
  constructor(
    private readonly extractionRepo: IExtractionRepository,
    private readonly dataModelRepo: IDataModelRepository,
    private readonly fileLoader: FileLoader,
    private readonly extractor: StructuredDataExtractor
  ) {}

  async execute(extractionId: string): Promise<void> {
    const extraction = await this.extractionRepo.getExtraction(extractionId);
    if (!extraction) return;

    const dataModel = await this.dataModelRepo.getDataModel(
      extraction.userId,
      extraction.dataModelId
    );
    if (!dataModel) return;

    const transitioned = await this.extractionRepo.tryTransition(
      extractionId,
      "queued",
      "processing"
    );
    if (!transitioned) return;

    try {
      // 1) Load file content
      const { content } = await this.fileLoader.load(
        extraction.userId,
        extraction.fileId
      );

      // 2) Extract rows
      const jsonSchema = schemaDefinitionToJsonSchema(dataModel.fields);
      const jsonSchemaWithEvidence = withEvidence(jsonSchema);
      const rows = await this.extractor.extractRows(
        content,
        jsonSchemaWithEvidence,
        extraction.pivotOn
      );

      // 3) For each extracted row, persist a record
      await Promise.all(
        rows.map((row, idx) =>
          this.extractionRepo.putExtractionRecord({
            id: crypto.randomUUID(),
            extractionId: extraction.id,
            rowNumber: idx + 1,
            pivotKey: extraction.pivotOn,
            fields: row,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        )
      );

      // Mark extraction as finished
      await this.extractionRepo.finish(extraction.id, { status: "completed" });
    } catch (e) {
      await this.extractionRepo.finish(extraction.id, { status: "failed" });
      throw e;
    }
  }
}
