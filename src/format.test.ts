import { describe, it, expect } from "vitest";
import { formatGBP, formatDate } from "./format.js";
import fixtures from "./fixtures.json" with { type: "json" };

describe("formatGBP", () => {
  for (const { input, output } of fixtures.formatGBP) {
    it(`${input} -> ${output}`, () => {
      expect(formatGBP(input)).toBe(output);
    });
  }

  it("non-finite input never throws", () => {
    expect(formatGBP(NaN)).toBe("£0.00");
    expect(formatGBP(Infinity)).toBe("£0.00");
  });
});

describe("formatDate", () => {
  for (const { input, style, output } of fixtures.formatDate) {
    it(`${input} (${style}) -> "${output}"`, () => {
      expect(formatDate(input, style as "short" | "full")).toBe(output);
    });
  }

  it("defaults to short style", () => {
    expect(formatDate("2026-08-09")).toBe("9 Aug");
  });
});
