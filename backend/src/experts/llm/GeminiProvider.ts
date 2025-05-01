import { LLMProvider } from './LLMProvider';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiProvider implements LLMProvider {
  private model: any;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async generate(prompt: string): Promise<string> {
    const result = await this.model.generateContent([prompt]);
    return result.response.text();
  }
}