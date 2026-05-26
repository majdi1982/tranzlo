import type { Conversation, Message } from "@/types";

export const mockConversations: Conversation[] = [
  {
    $id: "mock_conv_1",
    participants: ["mock_translator_1", "mock_company_1"],
    jobId: "mock_job_1",
    lastMessageAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    lastMessagePreview: "Thank you! I will start working on it right away.",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    $id: "mock_conv_2",
    participants: ["mock_translator_1", "mock_company_1"],
    jobId: "mock_job_5",
    lastMessageAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    lastMessagePreview: "The technical manual translation is coming along well.",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    $id: "mock_conv_3",
    participants: ["mock_translator_2", "mock_company_1"],
    jobId: "mock_job_2",
    lastMessageAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    lastMessagePreview: "I have attached my credentials for your review.",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    $id: "mock_conv_4",
    participants: ["mock_translator_1", "mock_company_2"],
    jobId: "mock_job_4",
    lastMessageAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    lastMessagePreview: "I am available for this project if needed.",
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
];

export const mockMessages: Message[] = [
  {
    $id: "mock_msg_1",
    conversationId: "mock_conv_1",
    senderId: "mock_company_1",
    content: "Hi Alex, thanks for applying to the legal contract translation project. Do you have experience with NDAs?",
    read: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    $id: "mock_msg_2",
    conversationId: "mock_conv_1",
    senderId: "mock_translator_1",
    content: "Yes, I have translated numerous NDAs and confidentiality agreements. Happy to share samples.",
    read: true,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    $id: "mock_msg_3",
    conversationId: "mock_conv_1",
    senderId: "mock_company_1",
    content: "Great! Let's proceed. Please find the contract attached.",
    read: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    $id: "mock_msg_4",
    conversationId: "mock_conv_1",
    senderId: "mock_translator_1",
    content: "Perfect, I have received the document. I will deliver by the end of this week.",
    read: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    $id: "mock_msg_5",
    conversationId: "mock_conv_1",
    senderId: "mock_company_1",
    content: "Looking forward to it!",
    read: false,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    $id: "mock_msg_6",
    conversationId: "mock_conv_1",
    senderId: "mock_translator_1",
    content: "Thank you! I will start working on it right away.",
    read: false,
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    $id: "mock_msg_7",
    conversationId: "mock_conv_2",
    senderId: "mock_company_1",
    content: "How is the technical manual translation progressing?",
    read: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    $id: "mock_msg_8",
    conversationId: "mock_conv_2",
    senderId: "mock_translator_1",
    content: "The technical manual translation is coming along well. I am about 60% done and on schedule.",
    read: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export function getMockConversationForUser(userId: string): Conversation[] {
  return mockConversations.filter((c) => c.participants.includes(userId));
}

export function getMockMessages(conversationId: string): Message[] {
  return mockMessages.filter((m) => m.conversationId === conversationId);
}
