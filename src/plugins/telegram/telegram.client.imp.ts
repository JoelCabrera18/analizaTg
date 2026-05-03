import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { NewMessage } from "telegram/events";
import { NewMessageEvent } from "telegram/events/NewMessage";
// @ts-ignore
import input from "input";
import { CustomTelegramClient } from "./custom.telegram.client";
import { TelegramClientProperties } from "./telegram.client.properties";

export class TelegramClientImp extends CustomTelegramClient {
  private client: TelegramClient;
  private readonly apiId: number;
  private readonly apiHash: string;

  private constructor(public readonly props: TelegramClientProperties) {
    super();
    const stringSession = new StringSession(props.session);
    this.apiId = props.apiId;
    this.apiHash = props.apiHash;

    this.client = new TelegramClient(stringSession, this.apiId, this.apiHash, {
      connectionRetries: 5,
    });
  }

  public static async create(props: TelegramClientProperties): Promise<TelegramClientImp> {
    const { session } = props;
    const instance = new TelegramClientImp(props);

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
        const message = event.message;
        console.log(`New message from ${message.senderId}: ${message.text}`);
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
