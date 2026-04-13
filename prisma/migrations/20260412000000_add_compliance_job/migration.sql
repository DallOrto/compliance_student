CREATE TYPE "ComplianceJobStatus" AS ENUM ('PROCESSING', 'DONE');

CREATE TABLE "compliance_jobs" (
  "id"          TEXT NOT NULL,
  "studentId"   TEXT NOT NULL,
  "callbackUrl" TEXT NOT NULL,
  "status"      "ComplianceJobStatus" NOT NULL DEFAULT 'PROCESSING',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),

  CONSTRAINT "compliance_jobs_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "compliance_jobs"
  ADD CONSTRAINT "compliance_jobs_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "Student"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
