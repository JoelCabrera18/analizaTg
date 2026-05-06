import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { NewMessage } from "telegram/events";
import { NewMessageEvent } from "telegram/events/NewMessage";
// @ts-ignore
import input from "input";
import { CustomTelegramClient } from "./custom.telegram.client";
import { TelegramClientProperties } from "./telegram.client.properties";
import { LlmService } from "../llm/llm.service";
import { promises as fs } from "fs";
import path from "path";

export class TelegramClientImp extends CustomTelegramClient {
  private client: TelegramClient;
  private readonly apiId: number;
  private readonly apiHash: string;

  private constructor(
    public readonly props: TelegramClientProperties,
    private readonly qwenService: LlmService,
    private readonly systemPrompt: string,
  ) {
    super();
    const stringSession = new StringSession(props.session);
    this.apiId = props.apiId;
    this.apiHash = props.apiHash;

    this.client = new TelegramClient(stringSession, this.apiId, this.apiHash, {
      connectionRetries: 5,
    });
  }

  public static async create(props: TelegramClientProperties, qwenService: LlmService): Promise<TelegramClientImp> {
    const { session } = props;

    // Cargar el prompt desde el archivo txt
    const promptPath = path.join(process.cwd(), "src", "prompts", "job-analysis.txt");
    const systemPrompt = await fs.readFile(promptPath, "utf-8");

    const instance = new TelegramClientImp(props, qwenService, systemPrompt);

    if (session) {
      await instance.client.connect();
      if (await instance.client.isUserAuthorized()) {
        console.log("Successfully connected to Telegram using saved session");
        return instance;
      }
      console.log("The saved session is invalid or has expired. Starting login flow...");
    }

    await instance.initSession(instance.client);
    return instance;
  }

  private async initSession(client: TelegramClient): Promise<TelegramClient> {
    await client.start({
      phoneNumber: async () => await input.text("Ingresa tu número de teléfono: "),
      phoneCode: async () => await input.text("Ingresa el código que recibiste en Telegram: "),
      password: async () => await input.password("Ingresa tu contraseña de 2FA: "),
      onError: (err) => console.error("Connection Error:", err),
    });

    console.log("Successfully connected to Telegram");
    const savedSession = client.session.save() as unknown as string;
    console.log("Your Session String (Save this to your .env):", savedSession);

    return client;
  }

  public async listenNewMessagesFromChannel(channel: string[]): Promise<void> {
    this.client.addEventHandler(
      async (event: NewMessageEvent) => {
        console.log("Analizando mensaje....");
        const message = event.message;

        const userPrompt = `Analiza este mensaje de Telegram: "${message?.text}"`;
        try {
          const llmResponse = await this.qwenService.generateContent(userPrompt, this.systemPrompt);

          if (llmResponse !== "IGNORAR") {
            console.log("--- OPORTUNIDAD DETECTADA ---");
            console.log(llmResponse);
            console.log("----------------------------");
          }
        } catch (error) {
          console.log(error);
        }
      },
      new NewMessage({
        incoming: true,
        chats: [...channel],
      }),
    );
  }

  public async disconnect(): Promise<void> {
    await this.client.disconnect();
  }
}
