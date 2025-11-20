// lib/chat-utils.ts
// ✅ 这个文件没有 import { db } ...，所以前端引用它是绝对安全的！

import { nanoid } from "nanoid";
// 这里的 schema 引用通常是安全的，只要 schema 文件里没有创建数据库连接
import type { Message, MessagePart, DBMessage } from "./db/schema"; 

// 1. 把类型定义搬过来
export type AIMessage = {
  role: string;
  content: string | any[];
  id?: string;
  parts?: MessagePart[];
};

export type UIMessage = {
  id: string;
  role: string;
  content: string;
  parts: MessagePart[];
  createdAt?: Date;
};

// 2. 把纯转换函数搬过来
export function getTextContent(message: Message): string {
  try {
    const parts = message.parts as MessagePart[];
    return parts
      .filter(part => part.type === 'text' && part.text)
      .map(part => part.text)
      .join('\n');
  } catch (e) {
    return '';
  }
}

export function convertToUIMessages(dbMessages: Array<Message>): Array<UIMessage> {
  return dbMessages.map((message) => ({
    id: message.id,
    parts: message.parts as MessagePart[],
    role: message.role as string,
    content: getTextContent(message),
    createdAt: message.createdAt,
  }));
}

export function convertToDBMessages(aiMessages: AIMessage[], chatId: string): DBMessage[] {
  // ... (把 convertToDBMessages 的代码完整搬过来) ...
    return aiMessages.map(msg => {
    const messageId = msg.id || nanoid();
    // If msg has parts, use them directly
    if (msg.parts) {
      return {
        id: messageId,
        chatId,
        role: msg.role,
        parts: msg.parts,
        createdAt: new Date()
      };
    }
    // Otherwise, convert content to parts
    let parts: MessagePart[];
    if (typeof msg.content === 'string') {
      parts = [{ type: 'text', text: msg.content }];
    } else if (Array.isArray(msg.content)) {
      if (msg.content.every(item => typeof item === 'object' && item !== null)) {
        parts = msg.content as MessagePart[];
      } else {
        parts = [{ type: 'text', text: JSON.stringify(msg.content) }];
      }
    } else {
      parts = [{ type: 'text', text: String(msg.content) }];
    }
    return {
      id: messageId,
      chatId,
      role: msg.role,
      parts,
      createdAt: new Date()
    };
  });
}