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
  //
  // ÖNEMLİ: `prisma migrate dev` KULLANMAYIN — shadow database (Prisma'nın
  // diff hesaplamak için oluşturduğu geçici boş DB) Supabase'in "auth" şemasını
  // içermiyor, bu yüzden RLS politikalarımızdaki auth.uid() referanslarıyla
  // P3018 hatası verip patlıyor. Yeni migration eklerken: schema.prisma'yı
  // güncelleyin, prisma/migrations altına elle bir klasör+migration.sql
  // oluşturun (mevcut migration'lardaki stile bakın), sonra
  // `npx prisma migrate deploy` ile uygulayın.
  datasource: {
    url: env("DIRECT_URL"),
  },
});