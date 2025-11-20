"use server";

import { generateObject } from "ai";
import { z } from "zod";
import { createOpenAI } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";

// Helper: extract text content from different message shapes
function getMessageText(message: any): string {
  if (!message) return "";
  if (Array.isArray(message.parts)) {
    return message.parts.map((p: any) => p?.text || "").filter(Boolean).join("\n");
  }
  if (typeof message.content === "string") return message.content;
  if (Array.isArray(message.content)) {
    return message.content.map((c: any) => (typeof c === "string" ? c : c?.text)).filter(Boolean).join("\n");
  }
  if (typeof message.content === "object" && message.content?.text) return message.content.text;
  return typeof message === "string" ? message : JSON.stringify(message);
}

export async function generateTitle(messages: any[]): Promise<string> {
  const userMessage = messages.find((m) => m.role === "user");
  if (!userMessage) return "New Chat";

  const messageText = getMessageText(userMessage);
  if (!messageText.trim()) return "New Chat";

  const fallbackTitle = messageText.slice(0, 30) + (messageText.length > 30 ? "..." : "");

  try {
    let modelToUse: any;

    if (process.env.OPENAI_API_KEY) {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
      modelToUse = openai("gpt-4o-mini");
    } else if (process.env.GROQ_API_KEY) {
      const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
      modelToUse = groq("llama-3.1-8b-instant");
    } else {
      return fallbackTitle;
    }

    const { object: titleObject } = await generateObject({
      model: modelToUse,
      schema: z.object({ title: z.string().describe("A short, descriptive title for the conversation") }),
      prompt: `Generate a concise title (max 6 words) for a conversation that starts with: "${messageText.slice(0, 200)}"`,
    });

    return titleObject?.title || fallbackTitle;
  } catch (error) {
    console.error("Error generating title:", error);
    return fallbackTitle;
  }
}