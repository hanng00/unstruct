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
import { StructuredDataExtractor } from "./extractor";
import { BasicExtractionAgent } from "./llm/basic-agent";
import { PivotedExtractionAgent } from "./llm/pivoted-extraction-agent";
import { RunExtractionUseCase } from "./run-extraction.use-case";

export const createBasicExtractor = (): StructuredDataExtractor => {
  return new StructuredDataExtractor(
    new S3Service(),
    new DDBFileRepository(),
    new DataModelRepository(),
    new BasicExtractionAgent(),
    [
      new PdfLoader(),
      new DocxLoader(),
      new ExcelLoader(),
      new EmlLoader(),
      new HtmlLoader(),
      new TextLikeLoader(),
      new FallbackLoader(),
    ]
  );
};

export const createRunExtractionUseCase = (): RunExtractionUseCase => {
  const basicExtractor = createBasicExtractor();
  const pivotedExtractor = new StructuredDataExtractor(
    new S3Service(),
    new DDBFileRepository(),
    new DataModelRepository(),
    new PivotedExtractionAgent(),
    [
      new PdfLoader(),
      new DocxLoader(),
      new ExcelLoader(),
      new EmlLoader(),
      new HtmlLoader(),
      new TextLikeLoader(),
      new FallbackLoader(),
    ]
  );
  return new RunExtractionUseCase(new DDBExtractionRepository(), basicExtractor, pivotedExtractor);
};
