import { describe, expect, it } from "vitest";
import { DataModelService } from "../lib/data-model.service";
import { DataModelSchemaJson } from "../schemas/datamodel";

describe("DataModelService", () => {
  it("derives row-level schema whether nested or flat", () => {
    const flat = { properties: { a: { type: "string" } } };
    const nested = { properties: { rows: { items: flat } } };
    expect(DataModelService.getRowLevelSchema(flat)).toEqual(flat);
    expect(DataModelService.getRowLevelSchema(nested)).toEqual(flat);
  });

  it("infers field defs from plain object", () => {
    const defs = DataModelService.inferFieldDefsFromObject({ a: 1, b: "x" });
    expect(defs.map((d) => d.name)).toEqual(["a", "b"]);
  });

  it("ensureFieldExists adds missing field and keeps existing ones", () => {
    const schema: DataModelSchemaJson = { $schema: "", type: "object", properties: {}, required: [] };
    const updated = DataModelService.ensureFieldExists(schema, {
      fieldId: "foo",
      description: "",
      type: "string",
    });
    expect(updated.properties.foo).toBeTruthy();

    const unchanged = DataModelService.ensureFieldExists(updated, {
      fieldId: "foo",
      description: "",
      type: "string",
    });
    expect(unchanged).toBe(updated);
  });
});


