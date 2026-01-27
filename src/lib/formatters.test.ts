import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatFileSize,
  formatDuration,
} from "./formatters";

describe("formatCurrency", () => {
  it("should format USD currency", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });

  it("should format with different currencies", () => {
    expect(formatCurrency(1000, "EUR")).toContain("1,000");
  });

  it("should handle zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("should handle negative numbers", () => {
    expect(formatCurrency(-500)).toBe("-$500.00");
  });
});

describe("formatNumber", () => {
  it("should format large numbers with commas", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });

  it("should handle decimals", () => {
    expect(formatNumber(1234.56)).toBe("1,234.56");
  });
});

describe("formatPercent", () => {
  it("should format percentage", () => {
    expect(formatPercent(0.75)).toBe("75%");
  });

  it("should handle decimals", () => {
    expect(formatPercent(0.333, 1)).toBe("33.3%");
  });
});

describe("formatFileSize", () => {
  it("should format bytes", () => {
    expect(formatFileSize(500)).toBe("500 B");
  });

  it("should format kilobytes", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
  });

  it("should format megabytes", () => {
    expect(formatFileSize(1048576)).toBe("1 MB");
  });

  it("should format gigabytes", () => {
    expect(formatFileSize(1073741824)).toBe("1 GB");
  });
});

describe("formatDuration", () => {
  it("should format minutes", () => {
    expect(formatDuration(90)).toContain("1");
  });

  it("should format hours", () => {
    expect(formatDuration(60)).toContain("1");
  });
});
