import { describe, expect, it } from "vitest";

import { CITIES, candidateWithinRadius, generateDemoCandidates, getDemoProviderPage } from "../components/prospecting-domain";

describe("Demo search provider", () => {
  it("returns stable varied candidates and pages", () => {
    const first = generateDemoCandidates(CITIES[0], "dentist");
    expect(first).toEqual(generateDemoCandidates(CITIES[0], "dentist"));
    expect(first).toHaveLength(30);
    expect(new Set(first.map((candidate) => Boolean(candidate.website)))).toEqual(new Set([true, false]));
    expect(new Set(first.map((candidate) => Boolean(candidate.phone)))).toEqual(new Set([true, false]));
    expect(new Set(first.map((candidate) => Boolean(candidate.photoUrl)))).toEqual(new Set([true, false]));
    expect(getDemoProviderPage(CITIES[0], "dentist", 0)).toHaveLength(10);
    expect(getDemoProviderPage(CITIES[0], "dentist", 1)).toHaveLength(10);
  });

  it("applies the exact radius check to every candidate", () => {
    const candidates = generateDemoCandidates(CITIES[0], "dentist");
    expect(candidates.filter((candidate) => candidateWithinRadius(candidate, CITIES[0], 10)).length).toBeGreaterThan(20);
    expect(candidates.some((candidate) => !candidateWithinRadius(candidate, CITIES[0], 10))).toBe(true);
  });

  it("supports predefined cities with stable provider identifiers", () => {
    expect(CITIES.map((city) => [city.displayName, city.country, city.providerId])).toEqual([
      ["Jundiaí, Brazil", "Brazil", "demo:city:jundiai"],
      ["São Paulo, Brazil", "Brazil", "demo:city:sao-paulo"],
      ["Lisbon, Portugal", "Portugal", "demo:city:lisbon"],
    ]);
  });
});
