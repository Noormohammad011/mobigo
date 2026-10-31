import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// The CLI runs migrations over the DIRECT connection; the app uses the pooled
// DATABASE_URL through the driver adapter (src/lib/db.ts). See docs/SCHEMA.md §7.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
    // Local only: used by `migrate dev` / `migrate diff`. Unset on Supabase.
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
