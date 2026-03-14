import { Client, TextChannel } from "discord.js";
import { Balance } from "../models/balance.model";

export function startBackupTask(client: Client) {
  databaseBackup(client);
  setInterval(() => databaseBackup(client), 1000 * 60 * 60 * 24);
}

async function databaseBackup(client: Client) {
  try {
    console.log("Started backup...");

    const balances = await Balance.find();

    const buffer = Buffer.from(JSON.stringify(balances));

    const channel = await client.channels.fetch("1482349060407951442");
    if (!(channel instanceof TextChannel)) return;
    await channel.send({
      content: "Balance backup",
      files: [
        {
          attachment: buffer,
          name: "balances.json",
        },
      ],
    });
  } catch (err: any) {
    console.error("Backup failed: " + err);
  }
}
