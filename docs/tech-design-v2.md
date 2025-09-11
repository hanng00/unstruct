[1 tool called]

Let me rethink this from first principles, starting with the core business domain and working down to the technical implementation.

## 1. Entity Relationship Model (ERM) - First Principles

### Core Business Domain Analysis

**Primary Use Case**: Transform unstructured files into structured, synthesized product catalogs

**Key Business Entities**:

1. **USER** - The actor who owns and manages data
2. **WORKSPACE** - A container for related data processing activities
3. **FILE** - Raw unstructured input
4. **SCHEMA** - Definition of desired output structure
5. **EXTRACTION** - Structured data extracted from files
6. **RECORD** - Individual data rows within an extraction
7. **PRODUCT** - Synthesized final output combining multiple extractions
8. **SYNTHESIS_JOB** - Process that creates products from extractions

### Entity Relationships (Cardinality)

```
USER (1) ──→ (N) WORKSPACE
USER (1) ──→ (N) SCHEMA
USER (1) ──→ (N) FILE
USER (1) ──→ (N) PRODUCT

WORKSPACE (1) ──→ (N) EXTRACTION
WORKSPACE (1) ──→ (0..1) SCHEMA

FILE (1) ──→ (N) EXTRACTION
SCHEMA (1) ──→ (N) EXTRACTION

EXTRACTION (1) ──→ (N) RECORD
EXTRACTION (N) ──→ (N) PRODUCT (many-to-many)

SYNTHESIS_JOB (1) ──→ (1) PRODUCT
SYNTHESIS_JOB (1) ──→ (N) EXTRACTION
```

### Detailed Entity Definitions

[1 tool called]

```typescript
// Core Entities
interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

interface Workspace {
  id: string;
  userId: string;
  name: string;
  description?: string;
  defaultSchemaId?: string;
  createdAt: string;
  updatedAt: string;
}

interface File {
  id: string;
  userId: string;
  filename: string;
  mimeType: string;
  size: number;
  s3Key: string;
  status: "uploading" | "ready" | "processing" | "error";
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface Schema {
  id: string;
  userId: string;
  name: string;
  version: number;
  definition: {
    fields: Array<{
      name: string;
      type: string;
      required: boolean;
      isPrimaryKey?: boolean;
      mergeStrategy?: "first" | "last" | "concatenate" | "average";
      validation?: unknown;
    }>;
    synthesisRules?: {
      primaryKey: string;
      conflictResolution: Record<string, string>;
      llmPrompt?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface Extraction {
  id: string;
  workspaceId: string;
  fileId: string;
  schemaId: string;
  userId: string;
  status: "queued" | "processing" | "completed" | "failed";
  errorMessage?: string;
  recordCount: number;
  approvedRecordCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Record {
  id: string;
  extractionId: string;
  rowIndex: number;
  data: Record<string, unknown>;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  notes?: string;
}

interface Product {
  id: string;
  userId: string;
  workspaceId: string;
  name: string;
  description?: string;
  status: "draft" | "approved" | "published";
  synthesizedData: Record<string, unknown>;
  sourceExtractionIds: string[];
  synthesisJobId: string;
  createdAt: string;
  updatedAt: string;
}

interface SynthesisJob {
  id: string;
  userId: string;
  workspaceId: string;
  name: string;
  status: "queued" | "processing" | "completed" | "failed";
  extractionIds: string[];
  schemaId: string;
  synthesisMethod: "manual" | "llm" | "rule-based";
  configuration: Record<string, unknown>;
  result?: {
    productId: string;
    conflictsResolved: number;
    recordsProcessed: number;
  };
  createdAt: string;
  updatedAt: string;
}
```

## 2. Access Patterns - User Workflows

### Primary User Journeys

**1. File Upload & Processing**

- Upload files to workspace
- List files in workspace
- Get file processing status
- Retry failed file processing

**2. Schema Management**

- Create/edit data schemas
- List user's schemas
- Get schema details
- Version schema changes

**3. Extraction Review & Approval**

- List extractions in workspace
- Get extraction details with records
- Approve/reject individual records
- Bulk approve records
- Get approval statistics

**4. Product Synthesis**

- Create synthesis job from approved extractions
- List synthesis jobs
- Get synthesis job status
- Get synthesized product
- List products in workspace

**5. Cross-Workspace Operations**

- List all user workspaces
- Move extractions between workspaces
- Export products

### Detailed Access Patterns

```typescript
// File Management
AP1: Get files by workspace
AP2: Get file by ID
AP3: Update file status
AP4: List files by user (across workspaces)

// Schema Management
AP5: Get schemas by user
AP6: Get schema by ID
AP7: Get schema versions

// Extraction Management
AP8: Get extractions by workspace
AP9: Get extraction by ID with records
AP10: Get records by extraction
AP11: Update record approval status
AP12: Get extractions by file
AP13: Get extractions by schema

// Product Synthesis
AP14: Get synthesis jobs by workspace
AP15: Get synthesis job by ID
AP16: Get products by workspace
AP17: Get product by ID
AP18: Get extractions by product

// Cross-Entity Queries
AP19: Get workspace with extractions and products
AP20: Get user dashboard data (workspaces, files, products)
AP21: Get extraction approval statistics
AP22: Get synthesis job progress
```

## 3. DynamoDB Table Design

[1 tool called]

### Single Table Design with Access Pattern Optimization

**Table Name**: `unstruct-main`

**Primary Key Structure**:

- **PK**: Entity type + ID
- **SK**: Entity subtype + timestamp/ID

**Global Secondary Indexes**:

- **GSI1**: `GSI1PK` (reverse lookup), `GSI1SK` (entity type)
- **GSI2**: `GSI2PK` (status-based), `GSI2SK` (timestamp)
- **GSI3**: `GSI3PK` (workspace-based), `GSI3SK` (entity type)

### Detailed Key Patterns

```typescript
// Primary Table Items
interface DynamoDBItem {
  PK: string; // Partition Key
  SK: string; // Sort Key
  GSI1PK: string; // Reverse lookup
  GSI1SK: string; // Entity type
  GSI2PK: string; // Status-based queries
  GSI2SK: string; // Timestamp
  GSI3PK: string; // Workspace-based queries
  GSI3SK: string; // Entity type
  entityType: string; // USER, WORKSPACE, FILE, etc.
  data: unknown; // Entity data
  createdAt: string;
  updatedAt: string;
}

// Key Patterns
const KeyPatterns = {
  // User Management
  USER: {
    PK: `USER#${userId}`,
    SK: `META#`,
    GSI1PK: `USER#${userId}`,
    GSI1SK: `USER#${userId}`,
  },

  // Workspace Management
  WORKSPACE: {
    PK: `WS#${workspaceId}`,
    SK: `META#`,
    GSI1PK: `USER#${userId}`,
    GSI1SK: `WS#${workspaceId}`,
    GSI3PK: `WS#${workspaceId}`,
    GSI3SK: `WS#${workspaceId}`,
  },

  // File Management
  FILE: {
    PK: `FILE#${fileId}`,
    SK: `META#`,
    GSI1PK: `USER#${userId}`,
    GSI1SK: `FILE#${fileId}`,
    GSI2PK: `FILE#${status}`,
    GSI2SK: `FILE#${createdAt}`,
    GSI3PK: `WS#${workspaceId}`,
    GSI3SK: `FILE#${fileId}`,
  },

  // Schema Management
  SCHEMA: {
    PK: `SCHEMA#${schemaId}`,
    SK: `META#`,
    GSI1PK: `USER#${userId}`,
    GSI1SK: `SCHEMA#${schemaId}`,
    GSI2PK: `SCHEMA#${version}`,
    GSI2SK: `SCHEMA#${createdAt}`,
  },

  // Extraction Management
  EXTRACTION: {
    PK: `EXTRACTION#${extractionId}`,
    SK: `META#`,
    GSI1PK: `WS#${workspaceId}`,
    GSI1SK: `EXTRACTION#${extractionId}`,
    GSI2PK: `EXTRACTION#${status}`,
    GSI2SK: `EXTRACTION#${createdAt}`,
    GSI3PK: `FILE#${fileId}`,
    GSI3SK: `EXTRACTION#${extractionId}`,
  },

  // Record Management
  RECORD: {
    PK: `EXTRACTION#${extractionId}`,
    SK: `RECORD#${recordId}`,
    GSI1PK: `EXTRACTION#${extractionId}`,
    GSI1SK: `RECORD#${recordId}`,
    GSI2PK: `RECORD#${status}`,
    GSI2SK: `RECORD#${createdAt}`,
  },

  // Product Management
  PRODUCT: {
    PK: `PRODUCT#${productId}`,
    SK: `META#`,
    GSI1PK: `USER#${userId}`,
    GSI1SK: `PRODUCT#${productId}`,
    GSI2PK: `PRODUCT#${status}`,
    GSI2SK: `PRODUCT#${createdAt}`,
    GSI3PK: `WS#${workspaceId}`,
    GSI3SK: `PRODUCT#${productId}`,
  },

  // Synthesis Job Management
  SYNTHESIS_JOB: {
    PK: `SYNTHESIS#${jobId}`,
    SK: `META#`,
    GSI1PK: `USER#${userId}`,
    GSI1SK: `SYNTHESIS#${jobId}`,
    GSI2PK: `SYNTHESIS#${status}`,
    GSI2SK: `SYNTHESIS#${createdAt}`,
    GSI3PK: `WS#${workspaceId}`,
    GSI3SK: `SYNTHESIS#${jobId}`,
  },
};
```

### Access Pattern Implementation

```typescript
// AP1: Get files by workspace
const getFilesByWorkspace = async (workspaceId: string) => {
  return await dynamo.query({
    KeyConditionExpression: "GSI3PK = :pk AND begins_with(GSI3SK, :sk)",
    ExpressionAttributeValues: {
      ":pk": `WS#${workspaceId}`,
      ":sk": "FILE#",
    },
    IndexName: "GSI3",
  });
};

// AP8: Get extractions by workspace
const getExtractionsByWorkspace = async (workspaceId: string) => {
  return await dynamo.query({
    KeyConditionExpression: "GSI1PK = :pk AND begins_with(GSI1SK, :sk)",
    ExpressionAttributeValues: {
      ":pk": `WS#${workspaceId}`,
      ":sk": "EXTRACTION#",
    },
    IndexName: "GSI1",
  });
};

// AP9: Get extraction by ID with records
const getExtractionWithRecords = async (extractionId: string) => {
  const [extraction, records] = await Promise.all([
    dynamo.get({ PK: `EXTRACTION#${extractionId}`, SK: `META#` }),
    dynamo.query({
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `EXTRACTION#${extractionId}`,
        ":sk": "RECORD#",
      },
    }),
  ]);
  return { extraction, records };
};

// AP11: Update record approval status
const updateRecordApproval = async (
  extractionId: string,
  recordId: string,
  status: string
) => {
  return await dynamo.update({
    Key: { PK: `EXTRACTION#${extractionId}`, SK: `RECORD#${recordId}` },
    UpdateExpression: "SET #status = :status, #approvedAt = :approvedAt",
    ExpressionAttributeNames: {
      "#status": "status",
      "#approvedAt": "approvedAt",
    },
    ExpressionAttributeValues: {
      ":status": status,
      ":approvedAt": new Date().toISOString(),
    },
  });
};
```

## 4. Migration Strategy

[1 tool called]

### Migration from Current Model

**Current → New Entity Mapping**:

- `TABULAR_VIEW` → `WORKSPACE`
- `EXTRACTION` → `EXTRACTION` (enhanced with records)
- `FILE_REFERENCE` → `FILE`
- `DATA_MODEL` → `SCHEMA`

**Migration Steps**:

1. **Create new table** with GSI indexes
2. **Migrate existing data** with new key patterns
3. **Update application code** to use new access patterns
4. **Deploy new version** with backward compatibility
5. **Remove old table** after validation

**Data Transformation**:

```typescript
// Current TABULAR_VIEW → New WORKSPACE
const migrateTabularView = (tv: TabularView): Workspace => ({
  id: tv.id,
  userId: tv.userId,
  name: tv.name,
  description: undefined,
  defaultSchemaId: tv.dataModelId,
  createdAt: tv.createdAt,
  updatedAt: new Date().toISOString(),
});

// Current EXTRACTION → New EXTRACTION + RECORDS
const migrateExtraction = (
  ext: Extraction
): { extraction: Extraction; records: Record[] } => {
  const records = ext.data
    ? [
        {
          id: `${ext.id}_record_0`,
          extractionId: ext.id,
          rowIndex: 0,
          data: ext.data,
          status: "pending" as const,
          createdAt: ext.createdAt,
          updatedAt: ext.updatedAt,
        },
      ]
    : [];

  return {
    extraction: {
      ...ext,
      recordCount: records.length,
      approvedRecordCount: 0,
    },
    records,
  };
};
```

## Summary: What We End Up With

[1 tool called]

**From first principles, we end up with**:

1. **8 Core Entities** instead of 5, with proper separation of concerns
2. **22 Access Patterns** covering all user workflows
3. **Single DynamoDB table** with 3 GSI indexes optimized for access patterns
4. **Record-level approval workflow** supporting individual row approval/rejection
5. **Product synthesis pipeline** with synthesis jobs and conflict resolution
6. **Workspace-based organization** replacing the current tabular view concept
7. **Schema versioning** with synthesis rules and merge strategies

**Key Improvements**:

- ✅ **Granular approval workflow** (record-level vs extraction-level)
- ✅ **Product synthesis pipeline** (missing entirely in current model)
- ✅ **Workspace organization** (better than current tabular views)
- ✅ **Optimized access patterns** (no more scanning, efficient queries)
- ✅ **Conflict resolution** (built into schema definition)
- ✅ **Synthesis job tracking** (audit trail for product creation)

**Migration Impact**:

- **High** - requires significant refactoring
- **Worth it** - enables the full product vision
- **Manageable** - clear mapping from current to new model
- **Future-proof** - supports all documented workflows

This design transforms the current "file processing" system into a complete "data synthesis platform" that can handle the full product vision from the documentation.
