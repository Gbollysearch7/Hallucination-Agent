import { z } from "zod";

const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";
const DEFAULT_TEMPERATURE = 0.1;
const DEFAULT_TOP_P = 1;
const DEFAULT_GROQ_MAX_RETRIES = 2;
const DEFAULT_EXA_MAX_RETRIES = 2;

const numberSchema = z
  .string()
  .refine((value) => !Number.isNaN(Number.parseFloat(value)), {
    message: "Invalid number",
  })
  .transform((value) => Number.parseFloat(value));

const integerSchema = z
  .string()
  .refine((value) => Number.isInteger(Number.parseInt(value, 10)), {
    message: "Invalid integer",
  })
  .transform((value) => Number.parseInt(value, 10));

const parseEnvNumber = (name: string, fallback: number) => {
  const raw = process.env[name];
  if (!raw) return fallback;

  const result = numberSchema.safeParse(raw);
  if (!result.success) {
    console.warn(`${name} is not a valid number. Using fallback value: ${fallback}`);
    return fallback;
  }

  return result.data;
};

const parseEnvInteger = (name: string, fallback: number) => {
  const raw = process.env[name];
  if (!raw) return fallback;

  const result = integerSchema.safeParse(raw);
  if (!result.success) {
    console.warn(`${name} is not a valid integer. Using fallback value: ${fallback}`);
    return fallback;
  }

  return result.data;
};

const getStringEnv = (name: string) => {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
};

export const config = {
  exa: {
    apiKey: getStringEnv("EXA_API_KEY"),
    maxResults: parseEnvInteger("EXA_MAX_RESULTS", 3),
    maxRetries: parseEnvInteger("EXA_MAX_RETRIES", DEFAULT_EXA_MAX_RETRIES),
  },
  groq: {
    apiKey: getStringEnv("GROQ_API_KEY"),
    model: getStringEnv("GROQ_MODEL") ?? DEFAULT_GROQ_MODEL,
    temperature: parseEnvNumber("GROQ_TEMPERATURE", DEFAULT_TEMPERATURE),
    topP: parseEnvNumber("GROQ_TOP_P", DEFAULT_TOP_P),
    maxRetries: parseEnvInteger("GROQ_MAX_RETRIES", DEFAULT_GROQ_MAX_RETRIES),
  },
};

export type AppConfig = typeof config;
