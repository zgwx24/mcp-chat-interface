import { createGroq } from "@ai-sdk/groq";
import { createXai } from "@ai-sdk/xai";
import { createOpenAI } from "@ai-sdk/openai";

import {
  customProvider,
  wrapLanguageModel,
  extractReasoningMiddleware,
  LanguageModelV1
} from "ai";

export interface ModelInfo {
  provider: string;
  name: string;
  description: string;
  apiVersion: string;
  capabilities: string[];
}

const middleware = extractReasoningMiddleware({
  tagName: 'think',
});

const getApiKey = (key: string): string | undefined => {
  if (process.env[key]) {
    return process.env[key] || undefined;
  }
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(key) || undefined;
  }
  return undefined;
};

const languageModels: Record<string, LanguageModelV1> = {};

const openaiKey = getApiKey('OPENAI_API_KEY');
if (openaiKey) {
  const openaiClient = createOpenAI({ apiKey: openaiKey });
  languageModels["gpt-4o"] = openaiClient("gpt-4o");
  languageModels["gpt-4o-mini"] = openaiClient("gpt-4o-mini");
  languageModels["gpt-4-turbo"] = openaiClient("gpt-4-turbo");
}

const groqKey = getApiKey('GROQ_API_KEY');
if (groqKey) {
  const groqClient = createGroq({ apiKey: groqKey });
  languageModels["qwen3-32b"] = wrapLanguageModel({
    model: groqClient('qwen/qwen3-32b'),
    middleware
  });
  languageModels["kimi-k2"] = groqClient('moonshotai/kimi-k2-instruct');
  languageModels["llama4"] = groqClient('meta-llama/llama-4-scout-17b-16e-instruct');
}

const xaiKey = getApiKey('XAI_API_KEY');
if (xaiKey) {
  const xaiClient = createXai({ apiKey: xaiKey });
  languageModels["grok-3-mini"] = xaiClient("grok-3-mini-latest");
}

export const modelDetails: Record<string, ModelInfo> = {
  "gpt-4o": {
    provider: "OpenAI",
    name: "GPT-4o",
    description: "OpenAI's most advanced model with strong reasoning and coding capabilities.",
    apiVersion: "gpt-4o",
    capabilities: ["Reasoning", "Coding", "Multimodal"]
  },
  "gpt-4o-mini": {
    provider: "OpenAI",
    name: "GPT-4o Mini",
    description: "Faster and more affordable version of GPT-4o.",
    apiVersion: "gpt-4o-mini",
    capabilities: ["Fast", "Efficient", "Multimodal"]
  },
  "gpt-4-turbo": {
    provider: "OpenAI",
    name: "GPT-4 Turbo",
    description: "Enhanced version of GPT-4 with improved performance.",
    apiVersion: "gpt-4-turbo",
    capabilities: ["Reasoning", "Coding", "Multimodal"]
  },
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
  }
};

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

export const defaultModel = MODELS.length > 0 ? MODELS[0] : "gpt-4o-mini";