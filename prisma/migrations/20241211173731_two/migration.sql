/*
  Warnings:

  - Added the required column `password` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "reg_no" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Student'
);
INSERT INTO "new_Student" ("email", "id", "name", "reg_no", "role") SELECT "email", "id", "name", "reg_no", "role" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");
CREATE UNIQUE INDEX "Student_reg_no_key" ON "Student"("reg_no");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
