import { ExtractionRepository } from "@/features/extraction/repositories/extraction-repository";
import { RecordRepository } from "@/features/extraction/repositories/record-repository";
import { ProductRepository } from "@/features/product/repositories/product-repository";
import { SynthesisJobRepository } from "@/features/product/repositories/synthesis-job-repository";

const synthesisJobRepository = new SynthesisJobRepository();
const productRepository = new ProductRepository();
const recordRepository = new RecordRepository();
const extractionRepository = new ExtractionRepository();

export const handler = async (event: any): Promise<any> => {
  try {
    const failures: { itemIdentifier: string }[] = [];

    await Promise.all(
      event.Records.map(async (record: any) => {
        try {
          const message = JSON.parse(record.body);
          const { jobId, extractionIds, workspaceId, userId, schemaId, synthesisMethod } = message;

          // Update job status to processing
          await synthesisJobRepository.updateSynthesisJobStatus(jobId, "processing");

          // Get all approved records from extractions
          const allRecords: any[] = [];
          let totalConflictsResolved = 0;

          for (const extractionId of extractionIds) {
            const records = await recordRepository.getRecordsByExtraction(extractionId);
            const approvedRecords = records.filter(r => r.status === "approved");
            allRecords.push(...approvedRecords);
          }

          // Mock synthesis - combine records based on primary key
          const synthesizedData = synthesizeRecords(allRecords, schemaId);
          totalConflictsResolved = Math.floor(Math.random() * 5); // Mock conflict resolution

          // Create product
          const productId = crypto.randomUUID();
          const product = await productRepository.createProduct({
            id: productId,
            userId,
            workspaceId,
            name: `Synthesized Product ${new Date().toISOString()}`,
            description: `Product synthesized from ${extractionIds.length} extractions`,
            sourceExtractionIds: extractionIds,
            synthesisJobId: jobId,
          });

          // Update product with synthesized data
          await productRepository.updateProduct(productId, {
            synthesizedData,
            synthesisMetadata: {
              method: synthesisMethod,
              synthesizedAt: new Date().toISOString(),
              synthesizedBy: userId,
              conflictsResolved: totalConflictsResolved,
            },
          });

          // Update synthesis job with result
          await synthesisJobRepository.updateSynthesisJobResult(jobId, {
            productId,
            conflictsResolved: totalConflictsResolved,
            recordsProcessed: allRecords.length,
          });

          // Update job status to completed
          await synthesisJobRepository.updateSynthesisJobStatus(jobId, "completed");

        } catch (error) {
          console.error("Synthesis processing error:", error);
          const message = JSON.parse(record.body);
          await synthesisJobRepository.updateSynthesisJobStatus(message.jobId, "failed");
          failures.push({ itemIdentifier: record.messageId });
        }
      })
    );

    return { batchItemFailures: failures };
  } catch (error) {
    console.error("Synthesis handler error:", error);
    return { batchItemFailures: [] };
  }
};

function synthesizeRecords(records: any[], schemaId: string): Record<string, unknown> {
  // Mock synthesis logic - combine records by primary key
  const synthesized: Record<string, unknown> = {};
  
  // Group records by primary key (assuming 'sku' as primary key)
  const groupedRecords = records.reduce((acc, record) => {
    const key = record.data.sku || record.data.id || 'unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(record.data);
    return acc;
  }, {});

  // Synthesize each group
  const synthesizedProducts = Object.values(groupedRecords).map((group: any) => {
    const product = { ...group[0] }; // Start with first record
    
    // Merge additional data from other records
    group.slice(1).forEach((record: any) => {
      Object.keys(record).forEach(key => {
        if (product[key] !== record[key] && record[key]) {
          // Handle conflicts by concatenating or taking the latest
          if (typeof product[key] === 'string' && typeof record[key] === 'string') {
            product[key] = `${product[key]} | ${record[key]}`;
          } else {
            product[key] = record[key];
          }
        }
      });
    });

    return product;
  });

  return {
    products: synthesizedProducts,
    totalProducts: synthesizedProducts.length,
    sourceRecords: records.length,
    synthesizedAt: new Date().toISOString(),
  };
}
