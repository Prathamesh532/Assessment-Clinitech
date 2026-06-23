import { describe, expect, it } from "vitest";
import { formatNumber } from "./format";
describe("formatNumber", () => { it("renders missing values consistently", () => expect(formatNumber(null)).toBe("--")); it("limits decimal precision", () => expect(formatNumber(12.345)).toBe("12.3")); });
