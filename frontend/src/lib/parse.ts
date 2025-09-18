export const prettifyKey = (key: string) =>
  key
    // insert space before capitals (handles camelCase / PascalCase)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    // replace underscores with spaces (handles snake_case)
    .replace(/_/g, " ")
    // split into words
    .split(" ")
    // capitalize each word
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
