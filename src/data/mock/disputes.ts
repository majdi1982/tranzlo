import type { Dispute } from "@/types";

export const mockDisputes: Dispute[] = [
  {
    $id: "mock_dispute_1",
    jobId: "mock_job_1",
    raisedById: "mock_company_1",
    reason: "The translated contract contains several terminology errors and does not meet the required legal standards.",
    adminDecisionNote: "Reviewed the document. The translator will revise and resubmit within 3 days.",
    decision: "release",
    status: "resolved",
    resolvedBy: "mock_admin_1",
    resolvedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    $id: "mock_dispute_2",
    jobId: "mock_job_6",
    raisedById: "mock_translator_1",
    reason: "The company has not paid for the completed work. The financial report translation was delivered on time but payment is 3 weeks overdue.",
    status: "open",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];
