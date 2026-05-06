import { LlmErrorException } from "./llm-error.exception";
import { LlmProps } from "./llm.props";
import { LlmService } from "./llm.service";
import { InferenceClient } from "@huggingface/inference";

export class QwenService implements LlmService {
  private readonly hf: InferenceClient;

  constructor(private readonly props: LlmProps) {
    const { apiKey } = this.props;
    if (!apiKey) throw new Error("API Key de Hugging Face es requerida");
    this.hf = new InferenceClient(apiKey);
  }

  public async generateContent(prompt: string, context: string): Promise<string> {
    const { model, temperature, maxTokens } = this.props;

    if (!model) throw new Error("No se especifico el modelo");

    try {
      const response = await this.hf.chatCompletion({
        model,
        messages: [
          { role: "system", content: context },
          { role: "user", content: prompt },
        ],
        max_new_tokens: maxTokens,
        temperature: temperature,
      });

      const llmResponse = response.choices[0].message.content;
      if (!llmResponse) throw new LlmErrorException("La respuesta del modelo está vacía");

      return llmResponse;
    } catch (error: any) {
      throw new LlmErrorException(error.message || "Error inesperado al comunicarse con Hugging Face");
    }
  }
}
