import { TelegramClientImp } from "./plugins/telegram/telegram.client.imp";
import { config } from "dotenv";
config();

async function run() {
  const telegramClientConfig = {
    apiId: Number(process.env.TELEGRAM_API_ID),
    apiHash: process.env.TELEGRAM_API_HASH!,
    session: process.env.TELEGRAM_SESSION!,
  };

  const telegram = await TelegramClientImp.create(telegramClientConfig);
  const channels = ["5955877978", "-1001162074789"];
  await telegram.listenNewMessagesFromChannel(channels);
}

run().catch(console.error);
