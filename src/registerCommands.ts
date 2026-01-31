import { REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

if (process.env.TOKEN === undefined) {
  console.log("'TOKEN' is undefined");
  process.exit(1);
}
if (process.env.CLIENT_ID === undefined) {
  console.log("'CLIENT_ID' is undefined");
  process.exit(1);
}
if (process.env.GUILD_ID === undefined) {
  console.log("'GUILD_ID' is undefined");
  process.exit(1);
}

const commands = [
  // TODO ON HOLD
  // new SlashCommandBuilder()
  //   .setName("help")
  //   .setDescription("Shows all the available commands"),
  // new SlashCommandBuilder()
  //   .setName("mass")
  //   .setDescription("Mass commands")

  //   .addSubcommand((sub) =>
  //     sub.setName("create").setDescription("Create mass registration"),
  //   ),
  new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Balance commands")

    .addSubcommand((sub) =>
      sub
        .setName("adjust")
        .setDescription("Adjust balance of member")
        .addUserOption((option) =>
          option
            .setName("member")
            .setDescription("Member to adjust balance")
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("Amount to adjust")
            .setRequired(true),
        ),
    )

    .addSubcommand((sub) =>
      sub
        .setName("clear")
        .setDescription("Clear balance of member")
        .addUserOption((option) =>
          option
            .setName("member")
            .setDescription("Member to clear balance")
            .setRequired(true),
        ),
    )

    .addSubcommand((sub) =>
      sub
        .setName("cleanup")
        .setDescription("Removes all empty balances from database"),
    )

    .addSubcommand((sub) =>
      sub
        .setName("show")
        .setDescription("Show balance of member")
        .addUserOption((option) =>
          option
            .setName("member")
            .setDescription("Member to show balance")
            .setRequired(true),
        ),
    )

    .addSubcommand((sub) =>
      sub.setName("list").setDescription("Lists all open balances"),
    ),
];

const rest = new REST().setToken(process.env.TOKEN!);

export default async () => {
  console.log("Registering commands...");
  try {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID!,
        process.env.GUILD_ID!,
      ),
      { body: commands },
    );
    console.log("Commands were registered successfully");
  } catch (err) {
    console.log(`Error while registering comments: ${err}`);
  }
};
