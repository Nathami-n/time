/*
  Warnings:

  - Added the required column `password` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Teacher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "staff_no" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Teacher'
);
INSERT INTO "new_Teacher" ("email", "id", "name", "role", "staff_no") SELECT "email", "id", "name", "role", "staff_no" FROM "Teacher";
DROP TABLE "Teacher";
ALTER TABLE "new_Teacher" RENAME TO "Teacher";
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");
CREATE UNIQUE INDEX "Teacher_staff_no_key" ON "Teacher"("staff_no");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
