import { IStorageService } from "@/clients/s3";
import { DataModel } from "@/features/data-model/models/data-model";
import { IDataModelRepository } from "@/features/data-model/repositories/data-model-repository";
import { FileReference } from "@/features/files/models/file-reference";
import { IFileRepository } from "@/features/files/repositories/file-repository";
import { readFile } from "fs/promises";
import path from "path";
import { IContentLoader } from "../loaders/types";
import { withEvidence } from "../models/evidence";
import { Extraction } from "../models/extraction";
import { IStructuredExtractionLLM } from "./llm/interfaces";

/**
 *
 * Extract structured data from a file using a data model
 *
 * 1. Get the file reference
 * 2. Get the data model
 * 3. Download the file
 * 4. Extract the data
 * 5. Return the extraction
 *  */
export class StructuredDataExtractor {
  constructor(
    private readonly storageService: IStorageService,
    private readonly fileRepository: IFileRepository,
    private readonly dataModelRepository: IDataModelRepository,
    private readonly llm: IStructuredExtractionLLM,
    private readonly loaders: IContentLoader[] = []
  ) {
    this.storageService = storageService;
    this.fileRepository = fileRepository;
    this.dataModelRepository = dataModelRepository;
    this.llm = llm;
  }
  async extract(
    userId: string,
    fileId: FileReference["id"],
    dataModelId: DataModel["id"],
    pivotField?: string
  ): Promise<Extraction["data"]> {
    const fileReference = await this.getFileReferenceOrThrow(userId, fileId);
    const dataModel = await this.getDataModelOrThrow(userId, dataModelId);
    const localPath = await this.downloadToTmp(fileReference);
    const content = await this.loadContent(localPath, fileReference.mimeType);
    const schemaWithEvidence = withEvidence(dataModel.schemaJson);
    const result = await this.callStructuredLLM(content, schemaWithEvidence, pivotField);
    return result;
  }

  private async getFileReferenceOrThrow(
    userId: string,
    fileId: FileReference["id"]
  ): Promise<FileReference> {
    console.log("Getting file reference", userId, fileId);
    const { success, file, error } = await this.fileRepository.getFile(
      userId,
      fileId
    );
    if (!success || !file) throw new Error(error || "File reference not found");
    return file;
  }

  private async getDataModelOrThrow(
    userId: string,
    dataModelId: DataModel["id"]
  ) {
    console.log("Getting data model", userId, dataModelId);
    const dataModel = await this.dataModelRepository.getDataModel(
      userId,
      dataModelId
    );
    if (!dataModel) throw new Error("Data model not found");
    return dataModel;
  }

  private async downloadToTmp(file: FileReference): Promise<string> {
    console.log("Downloading file to tmp", file.filename);
    const tmpPath = "/tmp";
    const localPath = path.join(tmpPath, file.filename);
    await this.storageService.downloadFile(file.s3Key, localPath);
    return localPath;
  }

  private async loadContent(
    localPath: string,
    mimeType: string
  ): Promise<string> {
    console.log("Loading content", localPath, mimeType);
    const loader = this.loaders.find((l) => l.supports(mimeType));
    if (loader) {
      const { content } = await loader.load(localPath);
      return content;
    }
    try {
      return await readFile(localPath, "utf8");
    } catch (_) {
      return "";
    }
  }

  private async callStructuredLLM(
    content: string,
    schema: DataModel["schemaJson"],
    pivotField?: string
  ): Promise<Extraction["data"]> {
    console.log("Calling structured LLM", content, JSON.stringify(schema, null, 2));
    const result = await this.llm.structuredExtraction({
      content,
      schema,
      pivotField,
    });
    return result.data;
  }
}
