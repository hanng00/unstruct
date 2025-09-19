import {
  BatchProcessor,
  EventType,
  processPartialResponse,
} from "@aws-lambda-powertools/batch";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { DynamoDBRecord, DynamoDBStreamHandler } from "aws-lambda";
import { Extraction } from "./models/extraction";
import { createRunExtractionUseCase } from "./services/extractor.factory";

const processor = new BatchProcessor(EventType.DynamoDBStreams);
const runService = createRunExtractionUseCase();

interface ExtractionItem {
  PK: string;
  SK: string;
  status: string;
  extractionData: Extraction;
  createdAt: string;
  updatedAt: string;
}

export const recordHandler = async (record: DynamoDBRecord): Promise<void> => {
  console.log("Processing record:", JSON.stringify(record, null, 2));
  if (!isValidRecord(record)) return;

  try {
    const item = unmarshall(
      record.dynamodb?.NewImage as Record<string, AttributeValue>
    ) as ExtractionItem;
    console.log("Running extraction", item.extractionData.id);
    await runService.execute(item.extractionData.id);
  } catch (e) {
    console.error("Error running extraction", e);
    throw e;
  }
};

const isValidRecord = (record: DynamoDBRecord): boolean => {
  // Record must be CREATED or MODIFIED, and the SK must be an EXTRACTION
  if (record.eventName !== "INSERT" && record.eventName !== "MODIFY") {
    console.log("Record is not a CREATED or MODIFIED event");
    return false;
  }
  if (!record.dynamodb?.NewImage?.SK?.S?.startsWith("EXTRACTION#")) {
    console.log("Record is not an EXTRACTION");
    return false;
  }
  return true;
};

export const handler: DynamoDBStreamHandler = async (event, context) => {
  return processPartialResponse(event, recordHandler, processor, { context });
};
