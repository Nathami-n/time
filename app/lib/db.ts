import { PrismaClient } from "@prisma/client";
let db: PrismaClient | undefined;
if (process.env.NODE_ENV !== "production" && global.__db) {
  db = global.__db;
} else {
  db = new PrismaClient();
}

export { db };
