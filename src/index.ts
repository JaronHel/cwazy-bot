import { Client, IntentsBitField } from "discord.js";
import { connectToDb } from "./db/database";
import clientReady from "./events/clientReady";
import interactionCreate from "./events/interactionCreate";
import messageCreate from "./events/messageCreate";
import registerCommands from "./registerCommands";

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

clientReady(client);
interactionCreate(client);
messageCreate(client);

try {
  client.login(process.env.TOKEN);
  await connectToDb();
} catch (err) {
  console.log(`Client login failed: ${err}`);
  process.exit(1);
}

registerCommands();
