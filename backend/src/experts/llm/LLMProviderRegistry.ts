import { LLMProvider } from './LLMProvider';
import { GeminiProvider } from './GeminiProvider';
// import { OpenAIProvider } from './OpenAIProvider'; // for future use

/*
    This module is responsible for creating instances of LLM providers.
    And providing easy access to them based on the provider name without much modification in the code.
    This allows for easy addition of new LLM providers in the future.
*/

const providerFactory: Record<string, () => LLMProvider> = {
  gemini: () => new GeminiProvider(process.env.GEMINI_API_KEY || ''),
  // openai: () => new OpenAIProvider(process.env.OPENAI_API_KEY || ''),
};

export function getLLMProvider(providerName: string): LLMProvider {
  const factoryFn = providerFactory[providerName.toLowerCase()];
  if (!factoryFn) {
    throw new Error(`Unsupported LLM provider: ${providerName}`);
  }
  return factoryFn();
}