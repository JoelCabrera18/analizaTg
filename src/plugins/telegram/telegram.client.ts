import { TelegramClient } from "telegram";
import { NewMessage } from "telegram/events";
import { StringSession } from "telegram/sessions";
import { NewMessageEvent } from "telegram/events/NewMessage";

export abstract class CustomTelegramClient {
  abstract listenNewMessagesFromChannel(): Promise<void>;
}

export class TelegramClientImp extends CustomTelegramClient {
  private client: TelegramClient;
  private readonly apiId: number = 26774638;
  private readonly apiHash: string = "08825f873c204768fe8433e77d82bb6d";

  private constructor(session: string = "") {
    super();
    const stringSession = new StringSession(session);
    this.client = new TelegramClient(stringSession, this.apiId, this.apiHash, {
      connectionRetries: 5,
    });
  }

  /**
   * Factory method to handle asynchronous initialization properly.
   */
  public static async create(sessionString: string = ""): Promise<TelegramClientImp> {
    const instance = new TelegramClientImp(sessionString);
    
    // .start() connects AND handles authentication.
    // If sessionString is empty, it will ask for credentials in the terminal.
    await instance.client.start({
      phoneNumber: async () => "", // Handled by library if empty or provided via terminal
      phoneCode: async () => "", 
      onError: (err) => console.error("Connection Error:", err),
    });

    console.log("Successfully connected to Telegram");
    const savedSession = instance.client.session.save() as unknown as string;
    console.log("Your Session String (Save this to your .env):", savedSession);
    
    return instance;
  }

  public async listenNewMessagesFromChannel(): Promise<void> {
    this.client.addEventHandler(
      async (event: NewMessageEvent) => {
        const message = event.message;
        console.log(`New message from ${message.senderId}: ${message.text}`);
      },
      new NewMessage({
        incoming: true,
        // Optional: Filter by specific chat or user
        // fromUsers: ["@YourTargetChannel"]
      })
    );
  }

  public async disconnect(): Promise<void> {
    await this.client.disconnect();
  }
}
