import { GeminiService } from "./plugins/llm/gemini.service";
import { TelegramClientImp } from "./plugins/telegram/telegram.client.imp";
import { config } from "dotenv";
config();

async function run() {
  const telegramClientConfig = {
    apiId: Number(process.env.TELEGRAM_API_ID),
    apiHash: process.env.TELEGRAM_API_HASH!,
    session: process.env.TELEGRAM_SESSION!,
  };
  const llmProps = {
    model: process.env.GEMINI_MODEL!,
    apiKey: process.env.GEMINI_API_KEY!,
  };
  const geminiService = new GeminiService(llmProps);

  const telegram = await TelegramClientImp.create(telegramClientConfig, geminiService);
  const channels = ["5955877978", "-1001162074789", "-1001196137872"];

  try {
    await telegram.listenNewMessagesFromChannel(channels);
  } catch (error) {
    console.log(error);
  } finally {
    await telegram.disconnect();
  }
}

run().catch(console.error);
