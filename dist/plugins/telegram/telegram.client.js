"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramClientImp = exports.CustomTelegramClient = void 0;
const telegram_1 = require("telegram");
const events_1 = require("telegram/events");
const sessions_1 = require("telegram/sessions");
class CustomTelegramClient {
}
exports.CustomTelegramClient = CustomTelegramClient;
class TelegramClientImp extends CustomTelegramClient {
    client;
    apiId = 26774638;
    apiHash = "08825f873c204768fe8433e77d82bb6d";
    constructor(session = "") {
        super();
        const stringSession = new sessions_1.StringSession(session);
        this.client = new telegram_1.TelegramClient(stringSession, this.apiId, this.apiHash, {
            connectionRetries: 5,
        });
    }
    /**
     * Factory method to handle asynchronous initialization properly.
     */
    static async create(sessionString = "") {
        const instance = new TelegramClientImp(sessionString);
        // .start() connects AND handles authentication.
        // If sessionString is empty, it will ask for credentials in the terminal.
        await instance.client.start({
            phoneNumber: async () => "", // Handled by library if empty or provided via terminal
            phoneCode: async () => "",
            onError: (err) => console.error("Connection Error:", err),
        });
        console.log("Successfully connected to Telegram");
        const savedSession = instance.client.session.save();
        console.log("Your Session String (Save this to your .env):", savedSession);
        return instance;
    }
    async listenNewMessagesFromChannel() {
        this.client.addEventHandler(async (event) => {
            const message = event.message;
            console.log(`New message from ${message.senderId}: ${message.text}`);
        }, new events_1.NewMessage({
            incoming: true,
            // Optional: Filter by specific chat or user
            // fromUsers: ["@YourTargetChannel"]
        }));
    }
    async disconnect() {
        await this.client.disconnect();
    }
}
exports.TelegramClientImp = TelegramClientImp;
//# sourceMappingURL=telegram.client.js.map