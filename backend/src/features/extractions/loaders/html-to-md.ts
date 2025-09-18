import TurndownService from "turndown";

const td = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

td.addRule("preserveTables", {
  filter: ["table"],
  replacement: (content, node) => {
    // Let default table conversion happen; Turndown supports tables via GitHub Flavored Markdown when plugins are added.
    // For now, return content to avoid stripping inner text if tables aren't fully supported.
    return `\n\n${content}\n\n`;
  },
});

export const htmlToMarkdown = (html: string): string => {
  try {
    return td.turndown(html);
  } catch {
    return html;
  }
};


