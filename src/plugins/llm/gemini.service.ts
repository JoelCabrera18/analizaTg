import { GoogleGenAI } from "@google/genai";
import { LlmProps } from "./llm.props";
import { LlmService } from "./llm.service";

export class GeminiService implements LlmService {
  private model: GoogleGenAI;
  constructor(private readonly props: LlmProps) {
    const { apiKey } = this.props;
    this.model = new GoogleGenAI({ apiKey });
  }
  public async generateContent(prompt: string): Promise<string> {
    const { model } = this.props;
    const response = await this.model.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const { text: llmResponse } = response;
    if (!llmResponse) throw new Error("No se pudo generar el contenido");
    return llmResponse;
  }
}
