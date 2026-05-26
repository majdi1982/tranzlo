import type { HubPost } from "@/types";

export const mockHubPosts: HubPost[] = [
  {
    $id: "mock_hub_1",
    authorId: "mock_translator_1",
    title: "What tools do you use for CAT?",
    content: "I'm curious what computer-assisted translation tools everyone uses. I've been using Trados but thinking of switching to memoQ.",
    category: "Tools & Software",
    likes: ["mock_user_t2", "mock_user_c1"],
    status: "published",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    $id: "mock_hub_2",
    authorId: "mock_company_1",
    title: "Looking for medical translators",
    content: "We are expanding our medical translation department and looking for experienced medical translators. Please reach out if interested.",
    category: "Business Talk",
    likes: ["mock_user_t1"],
    status: "published",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    $id: "mock_hub_3",
    authorId: "mock_translator_2",
    title: "Tips for passing translation tests",
    content: "Many companies require translation tests. Here are my tips for passing them successfully.",
    category: "Career Advice",
    likes: [],
    status: "published",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    $id: "mock_hub_4",
    authorId: "mock_translator_1",
    title: "New Certification Available",
    content: "ATA has announced a new certification for medical translation. Details inside.",
    category: "Industry News",
    likes: ["mock_user_t2"],
    status: "pending_review",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    $id: "mock_hub_5",
    authorId: "mock_translator_3",
    title: "Draft: My translation workflow",
    content: "This is a draft post about my translation workflow. Will publish when complete.",
    category: "General Discussion",
    likes: [],
    status: "draft",
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

export function getMockHubPostsByStatus(status: string): HubPost[] {
  return mockHubPosts.filter((p) => p.status === status);
}

export function getMockHubPostById(postId: string): HubPost | undefined {
  return mockHubPosts.find((p) => p.$id === postId);
}
