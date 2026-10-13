import { beforeAll, bench, describe, vi } from "vitest";

import { createRequestResponse, data_stats, mockGraphQL } from "../utils.js";

let router;

beforeAll(async () => {
  vi.stubEnv("CACHE_SECONDS", "");
  vi.stubEnv("GIST_WHITELIST", "");
  vi.stubEnv("POSTGRES_URL", "");
  vi.stubEnv("WHITELIST", "");

  ({ default: router } = await import("../../router.js"));

  mockGraphQL(data_stats);
});

describe("bench /api", () => {
  bench(
    "base",
    async () => {
      const { req, res } = createRequestResponse("/api?username=anuraghazra");
      await router(req, res);
    },
    { warmupIterations: 50 },
  );
});
