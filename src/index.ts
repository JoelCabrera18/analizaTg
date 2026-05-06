import { QwenService } from "./plugins/llm/qwen.service";
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
    model: process.env.HF_IA_MODEL!,
    apiKey: process.env.HF_API_KEY!,
    temperature: 0.1,
    maxTokens: 8192,
  };
  const qwenService = new QwenService(llmProps);

  const telegram = await TelegramClientImp.create(telegramClientConfig, qwenService);
  const channels = ["5955877978", "-1001162074789", "-1001196137872"];

  try {
    await telegram.listenNewMessagesFromChannel(channels);
  } catch (error) {
    console.log(error);
  }
}

run().catch(console.error);
