import type { HubPostStatus } from "./common";

export interface HubPost {
  $id: string;
  authorId: string;
  title: string;
  content: string;
  category: string;
  likes: string[];
  status: HubPostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HubComment {
  $id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}
