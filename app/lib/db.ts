let db: PrismaClient | undefined;

if (process.env.NODE_ENV !== "production") {
  db = global.__db;
}
