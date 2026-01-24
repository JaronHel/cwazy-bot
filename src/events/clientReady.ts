import { ActivityType, Client } from "discord.js";

export default async (client: Client) => {
  client.on("clientReady", () => {
    if (client.user !== null) {
      console.log(`${client.user.tag} is ready`);
      client.user.setActivity({
        name: "Playing Albion Online",
        type: ActivityType.Custom,
      });
    }
  });
};
