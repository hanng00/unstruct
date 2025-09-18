import { readFile } from "fs/promises";
import type { AddressObject } from "mailparser";
import { simpleParser } from "mailparser";
import { htmlToMarkdown } from "./html-to-md";
import { IContentLoader, LoadResult } from "./types";

const EML_MIME_TYPES = ["message/rfc822", "application/eml"];

function addressToText(address: AddressObject | AddressObject[] | undefined | null): string | undefined {
  if (!address) return undefined;
  const toText = (a: AddressObject) => a.text;
  return Array.isArray(address) ? address.map(toText).join(", ") : toText(address);
}

export class EmlLoader implements IContentLoader {
  supports(mimeType: string): boolean {
    return EML_MIME_TYPES.includes(mimeType);
  }

  async load(localPath: string): Promise<LoadResult> {
    const buffer = await readFile(localPath);
    const mail = await simpleParser(buffer);
    const html = mail.html ? (typeof mail.html === "string" ? mail.html : mail.html?.toString() ?? "") : "";
    const text = mail.text || "";
    const content = html ? htmlToMarkdown(html) : text;
    const metadata = {
      subject: mail.subject,
      from: addressToText(mail.from as any),
      to: addressToText(mail.to as any),
      date: mail.date?.toISOString?.(),
      attachments: mail.attachments?.length ?? 0,
    } as Record<string, unknown>;
    return { content, metadata };
  }
}


