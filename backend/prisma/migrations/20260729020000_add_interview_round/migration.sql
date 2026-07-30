-- AlterTable
ALTER TABLE "Interview" ADD COLUMN "round" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Interview" ADD COLUMN "previousInterviewId" TEXT;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_previousInterviewId_fkey" FOREIGN KEY ("previousInterviewId") REFERENCES "Interview"("id") ON DELETE SET NULL ON UPDATE CASCADE;