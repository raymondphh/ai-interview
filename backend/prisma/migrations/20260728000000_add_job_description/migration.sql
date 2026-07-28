-- CreateTable
CREATE TABLE "JobDescription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "fileName" TEXT,
    "filePath" TEXT,
    "sourceUrl" TEXT,
    "rawText" TEXT,
    "analysis" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobDescription_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Interview" ADD COLUMN "jdId" TEXT;

-- AddForeignKey
ALTER TABLE "JobDescription" ADD CONSTRAINT "JobDescription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_jdId_fkey" FOREIGN KEY ("jdId") REFERENCES "JobDescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
