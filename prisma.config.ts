import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  // datasource.url is only needed for db push / migrate — not for generate.
  // Pass DATABASE_URL via shell env when running db:push.
  ...(process.env.DATABASE_URL
    ? { datasource: { url: process.env.DATABASE_URL } }
    : {}),
});
