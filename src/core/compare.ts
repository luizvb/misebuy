export type Unit = "kg" | "l" | "each";

export interface Offer {
  supplier: string;
  item: string;
  packSize: number;
  unit: Unit;
  packPrice: number;
  current?: boolean;
}

export interface Need {
  item: string;
  quantity: number;
  unit: Unit;
}

export interface PlannedLine {
  item: string;
  supplier: string;
  quantity: number;
  unit: Unit;
  packs: number;
  lineTotal: number;
  baselineTotal: number;
  confidence: number;
}

export interface PurchasePlan {
  lines: PlannedLine[];
  total: number;
  baseline: number;
  savings: number;
  bySupplier: Record<string, PlannedLine[]>;
  warnings: string[];
}

const aliases: Record<string, string[]> = {
  tomato: ["tomato", "tomatoes", "roma tomato", "roma tomatoes"],
  chicken: ["chicken thigh", "chicken thighs", "boneless thigh"],
  parmesan: ["parmesan", "parmigiano", "parmesan cheese"],
  oil: ["olive oil", "evoo", "extra virgin olive oil"],
  arugula: ["arugula", "rocket", "rocket leaves"],
  lemon: ["lemon", "lemons"],
};

function canonical(value: string): string {
  const normalized = value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  for (const [key, values] of Object.entries(aliases)) {
    if (values.some((candidate) => normalized.includes(candidate))) return key;
  }
  return normalized;
}

export function parseCsv(input: string): Offer[] {
  const rows = input.trim().split(/\r?\n/).filter(Boolean);
  if (rows.length < 2) throw new Error("Add a header and at least one supplier row.");
  const header = rows[0].split(",").map((cell) => cell.trim().toLowerCase());
  const required = ["supplier", "item", "pack_size", "unit", "pack_price"];
  if (required.some((key) => !header.includes(key))) {
    throw new Error("Use columns: supplier, item, pack_size, unit, pack_price.");
  }
  if (rows.length > 101) throw new Error("Guest mode accepts up to 100 offer rows.");
  return rows.slice(1).map((row, index) => {
    const values = row.split(",").map((cell) => cell.trim());
    const get = (key: string) => values[header.indexOf(key)];
    const unit = get("unit").toLowerCase() as Unit;
    if (!(["kg", "l", "each"] as Unit[]).includes(unit)) throw new Error(`Row ${index + 2} has an unsupported unit.`);
    const packSize = Number(get("pack_size"));
    const packPrice = Number(get("pack_price"));
    if (!get("supplier") || !get("item") || !Number.isFinite(packSize) || packSize <= 0 || !Number.isFinite(packPrice) || packPrice < 0) {
      throw new Error(`Row ${index + 2} has invalid values.`);
    }
    return { supplier: get("supplier"), item: get("item"), packSize, unit, packPrice, current: get("current") === "true" };
  });
}

export function buildPlan(offers: Offer[], needs: Need[]): PurchasePlan {
  const warnings: string[] = [];
  const lines: PlannedLine[] = [];
  for (const need of needs) {
    const matches = offers.filter((offer) => offer.unit === need.unit && canonical(offer.item) === canonical(need.item));
    if (!matches.length) {
      warnings.push(`No comparable offer for ${need.item}.`);
      continue;
    }
    const cost = (offer: Offer) => Math.ceil(need.quantity / offer.packSize) * offer.packPrice;
    const sorted = [...matches].sort((a, b) => cost(a) - cost(b));
    const best = sorted[0];
    const baselineOffer = matches.find((offer) => offer.current) ?? matches[0];
    lines.push({
      item: need.item,
      supplier: best.supplier,
      quantity: need.quantity,
      unit: need.unit,
      packs: Math.ceil(need.quantity / best.packSize),
      lineTotal: cost(best),
      baselineTotal: cost(baselineOffer),
      confidence: matches.length > 1 ? 0.96 : 0.78,
    });
  }
  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const baseline = lines.reduce((sum, line) => sum + line.baselineTotal, 0);
  const bySupplier = lines.reduce<Record<string, PlannedLine[]>>((groups, line) => {
    (groups[line.supplier] ??= []).push(line);
    return groups;
  }, {});
  return { lines, total, baseline, savings: Math.max(0, baseline - total), bySupplier, warnings };
}

export function planToCsv(plan: PurchasePlan): string {
  const header = "supplier,item,quantity,unit,packs,line_total";
  const rows = plan.lines.map((line) => [line.supplier, line.item, line.quantity, line.unit, line.packs, line.lineTotal.toFixed(2)].join(","));
  return [header, ...rows].join("\n");
}
