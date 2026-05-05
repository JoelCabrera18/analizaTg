export abstract class LlmService {
  abstract generateContent(prompt: string): Promise<string>;
}
