import { describe, expect, it } from "vitest";
import { isAuthorizedCron } from "./cron-auth";

describe("cron authorization", () => {
  it("accepts only the configured bearer token", () => {
    expect(isAuthorizedCron("Bearer test-secret", "test-secret")).toBe(true);
    expect(isAuthorizedCron("Bearer wrong", "test-secret")).toBe(false);
    expect(isAuthorizedCron(null, "test-secret")).toBe(false);
  });

  it("fails closed when CRON_SECRET is missing", () => {
    expect(isAuthorizedCron("Bearer undefined", undefined)).toBe(false);
  });
});
