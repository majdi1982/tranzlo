import type { Application } from "@/types";

export const mockApplications: Application[] = [
  {
    $id: "mock_app_1",
    jobId: "mock_job_1",
    translatorId: "mock_translator_1",
    coverLetter: "I have 8 years of experience in legal translation and have translated over 100 contracts. I am confident I can deliver high-quality work within your timeline.",
    status: "submitted",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    $id: "mock_app_2",
    jobId: "mock_job_3",
    translatorId: "mock_translator_1",
    coverLetter: "I have extensive experience in software localization for Japanese markets. I have worked with SaaS products similar to yours.",
    status: "shortlisted",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    $id: "mock_app_3",
    jobId: "mock_job_2",
    translatorId: "mock_translator_2",
    coverLetter: "With my PhD in Biology and 5 years of medical translation experience, I am perfectly suited for this medical research paper translation.",
    status: "submitted",
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    $id: "mock_app_4",
    jobId: "mock_job_5",
    translatorId: "mock_translator_1",
    coverLetter: "I have translated numerous technical manuals for industrial equipment. My background in engineering ensures accurate terminology.",
    status: "accepted",
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    $id: "mock_app_5",
    jobId: "mock_job_4",
    translatorId: "mock_translator_3",
    coverLetter: "Native German speaker with 5 years of marketing translation experience. I can help your website resonate with English-speaking audiences.",
    status: "rejected",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    $id: "mock_app_6",
    jobId: "mock_job_7",
    translatorId: "mock_translator_1",
    coverLetter: "I am an avid gamer and have localized 5 games previously. I understand gaming terminology and cultural nuances for the Korean market.",
    status: "submitted",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export function getMockApplicationsByJob(jobId: string): Application[] {
  return mockApplications.filter((a) => a.jobId === jobId);
}

export function getMockApplicationsByTranslator(translatorId: string): Application[] {
  return mockApplications.filter((a) => a.translatorId === translatorId);
}
