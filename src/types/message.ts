export interface Conversation {
  $id: string;
  participants: string[];
  jobId?: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  createdAt: string;
}

export interface Message {
  $id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
}
