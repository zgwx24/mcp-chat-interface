import { createGroq } from "@ai-sdk/groq";
import { createXai } from "@ai-sdk/xai";
import { createOpenAI } from "@ai-sdk/openai";

import {
  customProvider,
  wrapLanguageModel,
  extractReasoningMiddleware
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

// Helper to get API keys from environment variables first, then localStorage
const getApiKey = (key: string): string | undefined => {
  // Check for environment variables first
  if (process.env[key]) {
    return process.env[key] || undefined;
  }

  // Fall back to localStorage if available
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(key) || undefined;
  }

  return undefined;
};

const groqClient = createGroq({
  apiKey: getApiKey('GROQ_API_KEY'),
});

const xaiClient = createXai({
  apiKey: getApiKey('XAI_API_KEY'),
});

const openaiClient = createOpenAI({
  apiKey: getApiKey('OPENAI_API_KEY'),
});

const languageModels = {
  "gpt-4o": openaiClient("gpt-4o"),
  "gpt-4o-mini": openaiClient("gpt-4o-mini"),
  "gpt-4-turbo": openaiClient("gpt-4-turbo"),
  "qwen3-32b": wrapLanguageModel(
    {
      model: groqClient('qwen/qwen3-32b'),
      middleware
    }
  ),
  "grok-3-mini": xaiClient("grok-3-mini-latest"),
  "kimi-k2": groqClient('moonshotai/kimi-k2-instruct'),
  "llama4": groqClient('meta-llama/llama-4-scout-17b-16e-instruct')
};

export const modelDetails: Record<keyof typeof languageModels, ModelInfo> = {
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

// Update API keys when localStorage changes (for runtime updates)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    // Reload the page if any API key changed to refresh the providers
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

export const defaultModel: modelID = "gpt-4o-mini";
