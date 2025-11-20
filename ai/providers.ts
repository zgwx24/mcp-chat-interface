import { createGroq } from "@ai-sdk/groq";
import { createXai } from "@ai-sdk/xai";
import { createOpenAI } from "@ai-sdk/openai";

import {
  customProvider,
  wrapLanguageModel,
  extractReasoningMiddleware,
  type LanguageModelV1,
  type LanguageModelV1Middleware 
} from "ai";

export interface ModelInfo {
  provider: string;
  name: string;
  description: string;
  apiVersion: string;
  capabilities: string[];
}

// --- 1. API Key 管理工具 ---

// 获取 Key，如果没找到返回 "" (空字符串) 而不是 undefined
// 这样可以防止 createGroq 等函数在初始化阶段直接报错崩溃
const getApiKey = (key: string): string => {
  if (process.env[key]) return process.env[key]!;
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(key) || "";
  }
  return "";
};

// --- 2. 安全检查中间件 ---

// 这是一个工厂函数，生成检测特定 Key 是否存在的中间件
const createKeyCheckMiddleware = (keyName: string, providerName: string): LanguageModelV1Middleware => {
  return {
    transformParams: async ({ params }) => {
      const key = getApiKey(keyName);
      // 如果 Key 是空的，抛出一个友好的错误
      // 这个错误会被 AI SDK 捕获，并在前端的 onError 中显示，或者作为消息内容显示
      if (!key || key.trim() === "") {
        throw new Error(`配置缺失: 未检测到 ${providerName} API Key (${keyName})。请在设置中填写或配置环境变量。`);
      }
      return params; // Key 存在，继续执行
    }
  };
};

// 原有的 reasoning 中间件
const reasoningMiddleware = extractReasoningMiddleware({
  tagName: 'think',
});

// --- 3. 初始化 Clients (使用空字符串 fallback 防止崩溃) ---

const groqClient = createGroq({
  apiKey: getApiKey('GROQ_API_KEY'),
});

const xaiClient = createXai({
  apiKey: getApiKey('XAI_API_KEY'),
});

const openAIClient = createOpenAI({
  apiKey: getApiKey('OPENAI_API_KEY'),
});

// --- 4. 辅助函数：创建带安全检查的模型 ---

// 这个函数负责把 "模型" + "检查逻辑" + "Reasoning逻辑" 组装起来
const createSafeModel = (
  modelInstance: LanguageModelV1, 
  keyName: string, 
  providerName: string,
  enableReasoning: boolean = false
) => {
  const middlewares = [createKeyCheckMiddleware(keyName, providerName)];
  
  if (enableReasoning) {
    middlewares.push(reasoningMiddleware);
  }

  return wrapLanguageModel({
    model: modelInstance,
    middleware: middlewares // 可以同时支持多个中间件
  });
};

// --- 5. 定义模型列表 ---

const languageModels = {
  "qwen3-32b": createSafeModel(
    groqClient('qwen/qwen3-32b'),
    'GROQ_API_KEY',
    'Groq',
    true // 开启 Reasoning 解析
  ),
  "grok-3-mini": createSafeModel(
    xaiClient("grok-3-mini-latest"),
    'XAI_API_KEY',
    'xAI',
    false
  ),
  "kimi-k2": createSafeModel(
    groqClient('moonshotai/kimi-k2-instruct'),
    'GROQ_API_KEY',
    'Groq',
    false
  ),
  "llama4": createSafeModel(
    groqClient('meta-llama/llama-4-scout-17b-16e-instruct'),
    'GROQ_API_KEY',
    'Groq',
    false
  ),
  "gpt-4o": createSafeModel(
    openAIClient("gpt-4o"),
    'OPENAI_API_KEY',
    'OpenAI',
    false
  ),
  "gpt-4o-mini": createSafeModel(
    openAIClient("gpt-4o-mini"),
    'OPENAI_API_KEY',
    'OpenAI',
    false
  ),
};

// --- 6. 模型详情与导出 ---

export const modelDetails: Record<keyof typeof languageModels, ModelInfo> = {
  "kimi-k2": {
    provider: "Groq",
    name: "Kimi K2",
    description: "Latest version of Moonshot AI's Kimi K2 with good balance of capabilities.",
    apiVersion: "kimi-k2-instruct",
    capabilities: ["Balanced", "Efficient", "Agentic"]
  },
  "qwen3-32b": {
    provider: "Groq",
    name: "Qwen 3 32B",
    description: "Latest version of Alibaba's Qwen 32B with strong reasoning and coding capabilities.",
    apiVersion: "qwen3-32b",
    capabilities: ["Reasoning", "Efficient", "Agentic"]
  },
  "grok-3-mini": {
    provider: "XAI",
    name: "Grok 3 Mini",
    description: "Latest version of XAI's Grok 3 Mini with strong reasoning and coding capabilities.",
    apiVersion: "grok-3-mini-latest",
    capabilities: ["Reasoning", "Efficient", "Agentic"]
  },
  "llama4": {
    provider: "Groq",
    name: "Llama 4",
    description: "Latest version of Meta's Llama 4 with good balance of capabilities.",
    apiVersion: "llama-4-scout-17b-16e-instruct",
    capabilities: ["Balanced", "Efficient", "Agentic"]
  },
  "gpt-4o": {
    provider: "OpenAI",
    name: "GPT-4o",
    description: "OpenAI's flagship model with high intelligence and multimodal capabilities.",
    apiVersion: "gpt-4o",
    capabilities: ["Complex Reasoning", "Multimodal", "Agentic"]
  },
  "gpt-4o-mini": {
    provider: "OpenAI",
    name: "GPT-4o Mini",
    description: "Efficient and cost-effective model for fast tasks.",
    apiVersion: "gpt-4o-mini",
    capabilities: ["Fast", "Efficient", "Cost-effective"]
  }
};

// Update API keys when localStorage changes (for runtime updates)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key?.includes('API_KEY')) {
      window.location.reload();
    }
  });
}

export const model = customProvider({
  languageModels,
});

export type modelID = keyof typeof languageModels;

export const MODELS = Object.keys(languageModels);

export const defaultModel: modelID = "kimi-k2";