import { Client, TextChannel } from "discord.js";
import fs from "fs/promises";
import { Balance } from "../models/balance.model";

export function startBackupTask(client: Client) {
  databaseBackup(client);
  setInterval(() => databaseBackup(client), 1000 * 60 * 60 * 24);
}

async function databaseBackup(client: Client) {
  try {
    const balances = await Balance.find();

    const filePath = "./balances.json";

    await fs.writeFile(filePath, JSON.stringify(balances));

    await sendBackup(client, filePath);
  } catch (err: any) {
    console.error("Backup failed: " + err);
  }
}

async function sendBackup(client: Client, filePath: string) {
  const channel = await client.channels.fetch("1482349060407951442");
  if (!(channel instanceof TextChannel)) return;
  await channel.send({
    content: "Balance backup",
    files: [filePath],
  });
}
