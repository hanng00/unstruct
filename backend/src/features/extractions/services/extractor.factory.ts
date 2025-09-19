import { S3Service } from "@/clients/s3";
import { DataModelRepository } from "@/features/data-model/repositories/data-model-repository";
import { DDBFileRepository } from "@/features/files/repositories/file-repository";
import { DocxLoader } from "../loaders/docx-loader";
import { EmlLoader } from "../loaders/eml-loader";
import { ExcelLoader } from "../loaders/excel-loader";
import { FallbackLoader } from "../loaders/fallback-loader";
import { HtmlLoader } from "../loaders/html-loader";
import { PdfLoader } from "../loaders/pdf-loader";
import { TextLikeLoader } from "../loaders/text-loader";
import { DDBExtractionRepository } from "../repositories/extraction-repository";
import { FileLoader } from "./file-loader";
import { BasicExtractionAgent } from "./llm/basic-agent";
import { PivotedExtractionAgent } from "./llm/pivoted-extraction-agent";
import { RunExtractionUseCase } from "./run-extraction.use-case";
import { StructuredDataExtractor } from "./structured-data-extractor";

export const createRunExtractionUseCase = (): RunExtractionUseCase => {
  const basicExtractor = new StructuredDataExtractor(
    new BasicExtractionAgent(),
    new PivotedExtractionAgent()
  );

  return new RunExtractionUseCase(
    new DDBExtractionRepository(),
    new DataModelRepository(),
    new FileLoader(new S3Service(), new DDBFileRepository(), [
      new PdfLoader(),
      new DocxLoader(),
      new ExcelLoader(),
      new EmlLoader(),
      new HtmlLoader(),
      new TextLikeLoader(),
      new FallbackLoader(),
    ]),
    basicExtractor
  );
};
