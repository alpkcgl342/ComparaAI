import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Migration/CLI işlemleri (migrate, studio, db pull) DIRECT_URL üzerinden
  // gidiyor: Supabase'in pgbouncer pooler'ı (DATABASE_URL, port 6543) migration
  // sırasında gereken advisory lock/oturum davranışını desteklemiyor.
  // Uygulama çalışma zamanında (PrismaService) hâlâ DATABASE_URL (pooled)
  // kullanıyor — bkz. src/prisma/prisma.service.ts.
  datasource: {
    url: env("DIRECT_URL"),
  },
});