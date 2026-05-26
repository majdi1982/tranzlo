import type { Complaint } from "@/types";

export const mockComplaints: Complaint[] = [
  {
    $id: "mock_complaint_1",
    userId: "mock_translator_1",
    subject: "Late payment from company",
    description: "The company has not released the payment even though the work was delivered 2 weeks ago.",
    adminReply: "We have contacted the company and they will process the payment within 48 hours.",
    status: "resolved",
    resolvedBy: "mock_admin_1",
    resolvedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    $id: "mock_complaint_2",
    userId: "mock_company_1",
    subject: "Translator missed deadline",
    description: "The translator missed the deadline by 5 days without any communication. We need to escalate this.",
    adminReply: "",
    status: "open",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];
