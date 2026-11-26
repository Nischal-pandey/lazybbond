import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

export default defineConfig({
  schema: resolve("prisma/schema.prisma"),
  migrations: {
    path: resolve("prisma/migrations"),
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://lazybond:lazybond@localhost:5432/lazybond?schema=public",
  },
});
