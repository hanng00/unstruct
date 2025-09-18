import { readFile } from "fs/promises";
import * as XLSX from "xlsx";
import { IContentLoader, LoadResult } from "./types";

const EXCEL_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
];

const toMarkdownTable = (rows: (string | number | boolean | null)[][]): string => {
  if (rows.length === 0) return "";
  const header = rows[0].map((c) => (c ?? "").toString());
  const body = rows.slice(1).map((r) => r.map((c) => (c ?? "").toString()));
  const sep = header.map(() => "---");
  const line = (cols: string[]) => `| ${cols.join(" | ")} |`;
  return [line(header), line(sep), ...body.map((r) => line(r))].join("\n");
};

export class ExcelLoader implements IContentLoader {
  supports(mimeType: string): boolean {
    return EXCEL_MIME_TYPES.includes(mimeType);
  }

  async load(localPath: string): Promise<LoadResult> {
    const buffer = await readFile(localPath);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetNames = workbook.SheetNames;
    const parts: string[] = [];

    for (const name of sheetNames) {
      const ws = workbook.Sheets[name];
      if (!ws) continue;
      const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(ws, {
        header: 1,
        blankrows: false,
        raw: false,
      });
      const tableMd = toMarkdownTable(rows as any);
      parts.push(`# ${name}\n\n${tableMd}`);
    }

    const content = parts.join("\n\n");
    return { content, metadata: { sheets: sheetNames.length } };
  }
}


