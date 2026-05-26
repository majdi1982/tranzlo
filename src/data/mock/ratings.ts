import type { Rating } from "@/types";

export const mockRatings: Rating[] = [
  {
    $id: "mock_rating_1",
    jobId: "mock_job_6",
    fromUserId: "mock_company_2",
    toUserId: "mock_translator_1",
    stars: 5,
    reviewText: "Excellent work! The financial report translation was accurate and delivered ahead of schedule.",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    $id: "mock_rating_2",
    jobId: "mock_job_6",
    fromUserId: "mock_translator_1",
    toUserId: "mock_company_2",
    stars: 4,
    reviewText: "Good company to work with. Clear requirements and prompt communication.",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    $id: "mock_rating_3",
    jobId: "mock_job_4",
    fromUserId: "mock_translator_3",
    toUserId: "mock_company_2",
    stars: 3,
    reviewText: "The project was fine but communication could have been better.",
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    $id: "mock_rating_4",
    jobId: "mock_job_2",
    fromUserId: "mock_company_1",
    toUserId: "mock_translator_2",
    stars: 4,
    reviewText: "Good work on the medical paper. Will hire again.",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    $id: "mock_rating_5",
    jobId: "mock_job_5",
    fromUserId: "mock_company_1",
    toUserId: "mock_translator_1",
    stars: 5,
    reviewText: "Outstanding technical manual translation. Very thorough.",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    $id: "mock_rating_6",
    jobId: "mock_job_5",
    fromUserId: "mock_translator_1",
    toUserId: "mock_company_1",
    stars: 5,
    reviewText: "Great company, prompt payment, clear instructions.",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export function getMockRatingsForUser(userId: string): Rating[] {
  return mockRatings.filter((r) => r.toUserId === userId);
}

export function getMockAverageRating(userId: string): number {
  const ratings = getMockRatingsForUser(userId);
  if (ratings.length === 0) return 0;
  return ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;
}
