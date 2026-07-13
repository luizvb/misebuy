import { buildPlan, type Need, type Offer, type PurchasePlan } from "./compare";

export interface MatchingProvider {
  name: string;
  compare(offers: Offer[], needs: Need[]): Promise<PurchasePlan>;
}

export const localPreviewProvider: MatchingProvider = {
  name: "Local preview engine",
  async compare(offers, needs) {
    return buildPlan(offers, needs);
  },
};
