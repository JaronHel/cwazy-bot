import { Client } from "discord.js";

export default async (client: Client) => {
  client.on("messageCreate", async (msg) => {
    if (msg.author.bot) return;
    if (!msg.channel.isThread()) return;

    const thread = msg.channel;

    if (thread.ownerId !== msg.client.user.id) return;

    const massMessage = await thread.fetchStarterMessage();

    const lines = massMessage!.content.split("\n\n");
    console.log(lines[1]);
    // TODO Manage Sign Ups
  });
};
