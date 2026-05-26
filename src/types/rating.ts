export interface Rating {
  $id: string;
  jobId: string;
  fromUserId: string;
  toUserId: string;
  stars: number;
  reviewText?: string;
  createdAt: string;
}
