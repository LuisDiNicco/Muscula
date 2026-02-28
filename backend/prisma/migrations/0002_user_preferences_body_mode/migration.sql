-- CreateEnum
CREATE TYPE "BodyMode" AS ENUM ('BULK', 'CUT', 'MAINTENANCE', 'RECOMPOSITION');

-- AlterTable
ALTER TABLE "UserPreferences"
ADD COLUMN "bodyMode" "BodyMode" NOT NULL DEFAULT 'MAINTENANCE';
