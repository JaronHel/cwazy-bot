import { Client, IntentsBitField } from "discord.js";
import { connectToDb } from "./db/database";
import clientReady from "./events/clientReady";
import isButton from "./events/interactions/isButton";
import isChatInputCommand from "./events/interactions/isChatInputCommand";
import isModalSubmit from "./events/interactions/isModalSubmit";
import registerCommands from "./registerCommands";

// Client intents
export const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

// Events
clientReady(client);
isChatInputCommand(client);
isModalSubmit(client);
isButton(client);

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
