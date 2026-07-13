import { describe, expect, it } from "vitest";
import { buildPlan, parseCsv, planToCsv } from "./compare";
import { sampleNeeds, sampleOffers } from "./sample";

describe("MiseBuy comparison engine", () => {
  it("selects the lowest total pack cost and returns an exportable plan", () => {
    const plan = buildPlan(parseCsv(sampleOffers), sampleNeeds);
    expect(plan.lines).toHaveLength(6);
    expect(plan.total).toBeGreaterThan(0);
    expect(plan.savings).toBeGreaterThan(0);
    expect(planToCsv(plan)).toContain("supplier,item,quantity");
  });

  it("matches restaurant aliases without inventing unmatched items", () => {
    const plan = buildPlan(parseCsv(sampleOffers), [...sampleNeeds, { item: "Saffron", quantity: 1, unit: "kg" }]);
    expect(plan.warnings).toContain("No comparable offer for Saffron.");
    expect(plan.lines.some((line) => line.item === "Saffron")).toBe(false);
  });

  it("rejects unsafe or malformed input", () => {
    expect(() => parseCsv("supplier,item\nA,Tomato")).toThrow(/columns/i);
    expect(() => parseCsv("supplier,item,pack_size,unit,pack_price\nA,Tomato,-1,kg,2")).toThrow(/invalid/i);
  });
});
