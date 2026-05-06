export abstract class LlmService {
  abstract generateContent(prompt: string, content: string): Promise<string>;
}
