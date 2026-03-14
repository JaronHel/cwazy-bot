import { Client, IntentsBitField } from "discord.js";
import { connectToDb } from "./db/database";
import clientReady from "./events/clientReady";
import interactionCreate from "./events/interactionCreate";
import registerCommands from "./registerCommands";

export const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

clientReady(client);
interactionCreate(client);

try {
  await connectToDb();
} catch (err) {
  console.log(`Database connect failed: ${err}`);
  process.exit(1);
}

try {
  await client.login(process.env.TOKEN);
} catch (err) {
  console.log(`Client login failed: ${err}`);
  process.exit(1);
}

registerCommands();
