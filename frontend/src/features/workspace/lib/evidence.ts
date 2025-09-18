import { EvidenceData } from "@/features/extractions/models/evidence";

export const isEvidence = (val: unknown): val is EvidenceData => {
  return (
    typeof val === "object" &&
    val !== null &&
    "answer" in val &&
    "rationale" in val
  );
};
