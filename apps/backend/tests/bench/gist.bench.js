import { beforeAll, bench, describe, vi } from "vitest";

import {
  createRequestResponse,
  happy_path_gist_data,
  mockGraphQL,
} from "../utils.js";

let router;

beforeAll(async () => {
  vi.stubEnv("CACHE_SECONDS", "");
  vi.stubEnv("GIST_WHITELIST", "");
  vi.stubEnv("POSTGRES_URL", "");
  vi.stubEnv("WHITELIST", "");

  ({ default: router } = await import("../../router.js"));

  mockGraphQL(happy_path_gist_data);
});

describe("bench /api/gist", () => {
  bench(
    "base",
    async () => {
      const { req, res } = createRequestResponse("/api/gist?id=happy-gist-id");
      await router(req, res);
    },
    { warmupIterations: 50 },
  );
});
