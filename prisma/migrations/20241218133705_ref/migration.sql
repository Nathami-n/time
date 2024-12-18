/*
  Warnings:

  - Added the required column `ref` to the `Timetable` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Timetable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slot" INTEGER NOT NULL,
    "day" TEXT NOT NULL,
    "classRoom" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "ref" TEXT NOT NULL,
    "endTime" DATETIME NOT NULL,
    "teacherId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    CONSTRAINT "Timetable_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Timetable_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Timetable" ("classRoom", "day", "endTime", "id", "slot", "startTime", "teacherId", "unitId") SELECT "classRoom", "day", "endTime", "id", "slot", "startTime", "teacherId", "unitId" FROM "Timetable";
DROP TABLE "Timetable";
ALTER TABLE "new_Timetable" RENAME TO "Timetable";
CREATE UNIQUE INDEX "Timetable_ref_key" ON "Timetable"("ref");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
