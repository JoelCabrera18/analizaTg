export abstract class CustomTelegramClient {
  abstract listenNewMessagesFromChannel(channel: string[]): Promise<void>;
}
