import { ActivityType, Client } from "discord.js";
import { startBackupTask } from "../utils/task";

export default async (client: Client) => {
  client.once("ready", () => {
    if (client.user !== null) {
      console.log(`${client.user.tag} is ready`);
      client.user.setActivity({
        name: "Playing Albion Online",
        type: ActivityType.Custom,
      });
      startBackupTask(client);
    }
  });
};
