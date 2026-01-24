import {
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
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
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows all the available commands"),
  new SlashCommandBuilder()
    .setName("mass")
    .setDescription("Mass commands")

    .addSubcommand((sub) =>
      sub.setName("create").setDescription("Create mass registration"),
    ),
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
            .setDescription("Member to adjust balance for")
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("Amount to adjust")
            .setRequired(true),
        ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand((sub) =>
      sub
        .setName("show")
        .setDescription("Show balance of member")
        .addUserOption((option) =>
          option
            .setName("member")
            .setDescription("Member to show balance for")
            .setRequired(true),
        ),
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
