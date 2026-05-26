import { z } from "zod";

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1, "Message cannot be empty").max(5000),
});

export const createConversationSchema = z.object({
  participantId: z.string().min(1),
  jobId: z.string().optional(),
  initialMessage: z.string().min(1, "Message cannot be empty"),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
