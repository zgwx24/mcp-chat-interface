import { type Message, type MessagePart } from "./db/schema";

export type UIMessage = {
  id: string;
  role: string;
  content: string;
  parts: MessagePart[];
  createdAt?: Date;
};

export function convertToUIMessages(dbMessages: Array<Message>): Array<UIMessage> {
  return dbMessages.map((msg) => {
    const parts = (msg.parts as MessagePart[]) || [];
    const textContent = parts
      .filter((part) => part.type === "text" && part.text)
      .map((part) => part.text)
      .join("\n");

    return {
      id: msg.id,
      role: msg.role,
      content: textContent,
      parts,
      createdAt: msg.createdAt,
    };
  });
}

// Helper to get just the text content for display
export function getTextContent(message: Message): string {
  try {
    const parts = message.parts as MessagePart[];
    return parts
      .filter((part) => part.type === "text" && part.text)
      .map((part) => part.text)
      .join("\n");
  } catch (e) {
    // If parsing fails, return empty string
    return "";
  }
}

