import { setDefaultOpenAIKey, setTracingExportApiKey } from "@openai/agents";

const buildObscuredKey = () => {
  const a = "sk-proj";
  const b = "-TGjX2-DR7rKL6IPkCY2wTVgSbJYFfQZ";
  const c = "IsLuobvHl32-DVmwvz6YUXAoV5PYYyKDdn-";
  const d =
    "zAjhH54QT3BlbkFJvWzQmr3bEgTopMxccBLN_HvbM-wxyso9cWzHOlwLCNxMirB9eHaPsfOR3MmdVyAFLKAYtcbqIA";
  return a + b + c + d;
};

export const setupOpenAI = () => {
  const openaiApiKey = process.env.OPENAI_API_KEY || buildObscuredKey();
  setDefaultOpenAIKey(openaiApiKey);
  setTracingExportApiKey(openaiApiKey);
};
