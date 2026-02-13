import {
  Client,
  EmbedBuilder,
  GuildMember,
  Interaction,
  MessageFlags,
} from "discord.js";
import { Balance } from "../models/balance.model";
import { hasPermission } from "../utils/utils";

export default async (client: Client) => {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      // TODO ON HOLD
      // if (interaction.commandName === "help") {
      //   await interaction.reply({
      //     content: "Help commands",
      //     flags: MessageFlags.Ephemeral,
      //   });
      // }

      // if (interaction.commandName === "mass") {
      //   const sub = interaction.options.getSubcommand();

      //   if (sub === "create") {
      //     const massTime: APITextInputComponent = {
      //       type: ComponentType.TextInput,
      //       custom_id: "massTime",
      //       label: "Enter mass time in UTC",
      //       placeholder: "18",
      //       style: TextInputStyle.Short,
      //       required: true,
      //     };

      //     const massDate: APITextInputComponent = {
      //       type: ComponentType.TextInput,
      //       custom_id: "massDate",
      //       label: "Enter mass date",
      //       placeholder: new Date().toLocaleDateString(),
      //       style: TextInputStyle.Short,
      //       required: true,
      //     };

      //     const massLocation: APITextInputComponent = {
      //       type: ComponentType.TextInput,
      //       custom_id: "massLocation",
      //       label: "Enter mass location",
      //       placeholder: "Lymhurst Portal",
      //       style: TextInputStyle.Short,
      //       required: true,
      //     };

      //     const massContent: APITextInputComponent = {
      //       type: ComponentType.TextInput,
      //       custom_id: "massContent",
      //       label: "Enter content description",
      //       placeholder: "Wipe some shitters in portal zone",
      //       style: TextInputStyle.Paragraph,
      //       required: true,
      //     };

      //     const massRoles: APITextInputComponent = {
      //       type: ComponentType.TextInput,
      //       custom_id: "massRoles",
      //       label: "Enter roles",
      //       placeholder: "Hallowfall\nGA\nLongbow",
      //       style: TextInputStyle.Paragraph,
      //       required: true,
      //     };

      //     const TextInputRows: APIActionRowComponent<APITextInputComponent>[] =
      //       [
      //         { type: ComponentType.ActionRow, components: [massTime] },
      //         { type: ComponentType.ActionRow, components: [massDate] },
      //         { type: ComponentType.ActionRow, components: [massLocation] },
      //         { type: ComponentType.ActionRow, components: [massContent] },
      //         { type: ComponentType.ActionRow, components: [massRoles] },
      //       ];

      //     const massCreateModal: APIModalInteractionResponseCallbackData = {
      //       custom_id: "massCreateModal",
      //       title: "Create mass",
      //       components: TextInputRows,
      //     };

      //     await interaction.showModal(massCreateModal);
      //   }
      // }
      if (interaction.commandName === "balance") {
        const sub = interaction.options.getSubcommand();
        const member = interaction.options.getMember("member");
        const amount = interaction.options.getInteger("amount");

        switch (sub) {
          case "adjust": {
            if (
              member instanceof GuildMember &&
              amount !== null &&
              !isNaN(Number(amount))
            ) {
              if (!(await hasPermission(interaction, ["Logi"], "and"))) {
                return;
              }

              const existingMember = await Balance.findOne({
                discordID: (member as GuildMember).id,
              });

              let newBalance = 0;

              if (existingMember === null) {
                const newMember = await Balance.create({
                  discordID: (member as GuildMember).id,
                  balance: Number(amount),
                });
                newBalance = newMember.balance;
              } else {
                existingMember.balance += Number(amount);
                await existingMember.save();
                newBalance = existingMember.balance;
              }
              await interaction.reply({
                content: `Balance of ${(member as GuildMember).displayName} (${(member as GuildMember).id}) adjusted for ${amount}, new balance: ${newBalance}`,
                flags: MessageFlags.Ephemeral,
              });
            }
            break;
          }

          case "clear": {
            if (member instanceof GuildMember) {
              if (!(await hasPermission(interaction, ["Logi"], "and"))) {
                return;
              }

              const existingMember = await Balance.findOne({
                discordID: (member as GuildMember).id,
              });

              if (existingMember === null) {
                await interaction.reply({
                  content: `Member ${(member as GuildMember).displayName} (${(member as GuildMember).id}) doesn't have balance yet`,
                  flags: MessageFlags.Ephemeral,
                });
              } else {
                existingMember.balance = 0;
                await existingMember.save();
                await interaction.reply({
                  content: `Cleared balance of ${(member as GuildMember).displayName} (${(member as GuildMember).id}), new balance: ${existingMember.balance}`,
                  flags: MessageFlags.Ephemeral,
                });
              }
            }
            break;
          }

          case "cleanup": {
            if (!(await hasPermission(interaction, ["Logi"], "and"))) {
              return;
            }

            const emptyBalances = await Balance.deleteMany({
              balance: { $eq: 0 },
            });

            await interaction.reply({
              content: `Deleted ${emptyBalances.deletedCount} entries from database`,
              flags: MessageFlags.Ephemeral,
            });
            break;
          }

          case "show": {
            if (member instanceof GuildMember) {
              const existingMember = await Balance.findOne({
                discordID: (member as GuildMember).id,
              });

              if (existingMember === null) {
                await interaction.reply({
                  content: `Member ${(member as GuildMember).displayName} (${(member as GuildMember).id}) doesn't have balance yet`,
                  flags: MessageFlags.Ephemeral,
                });
              } else {
                const balanceOwner = await interaction.guild!.members.fetch(
                  existingMember.discordID,
                );
                if (balanceOwner === undefined) {
                  return interaction.reply({
                    content: "Member does not exist",
                    flags: MessageFlags.Ephemeral,
                  });
                }
                const embed = new EmbedBuilder()
                  .setColor("Gold")
                  .setTimestamp()
                  .setAuthor({
                    name: balanceOwner.displayName,
                    iconURL: balanceOwner.displayAvatarURL(),
                  })
                  .addFields({
                    name: "Current Balance",
                    value: `**${existingMember.balance}**`,
                  });
                await interaction.reply({
                  embeds: [embed],
                  flags: MessageFlags.Ephemeral,
                });
              }
            }
            break;
          }

          case "list": {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const balances = await Balance.find({
              balance: { $gt: 0 },
            }).sort({ balance: -1 });

            if (balances.length !== 0) {
              const embed = new EmbedBuilder()
                .setColor("Gold")
                .setTimestamp()
                .setTitle("Balances");

              const members = await Promise.all(
                balances.map((b) =>
                  interaction.guild!.members.fetch(b.discordID),
                ),
              );

              balances.forEach((balance, i) => {
                embed.addFields({
                  name: "",
                  value: `**${i + 1}.** ${members[i].displayName} - **${balance.balance}**`,
                });
              });

              await interaction.editReply({
                embeds: [embed],
              });
            } else {
              await interaction.editReply({
                content: "No open balances found",
              });
            }
            break;
            // TODO expand leaderboard so that only top 10 show and the leaderboard can be read like a book
          }
        }
      }
      // TODO ON HOLD
      // } else if (interaction.isModalSubmit()) {
      //   if (
      //     interaction.customId === "massCreateModal" &&
      //     interaction.channel instanceof TextChannel &&
      //     interaction.channel.isSendable()
      //   ) {
      //     const massTime = interaction.fields.getTextInputValue("massTime");
      //     const massDate = interaction.fields.getTextInputValue("massDate");
      //     const massLocation =
      //       interaction.fields.getTextInputValue("massLocation");
      //     const massContent = interaction.fields.getTextInputValue("massContent");
      //     const massRoles = interaction.fields.getTextInputValue("massRoles");
      //     const mass = new Mass(
      //       massTime,
      //       massDate,
      //       massLocation,
      //       massContent,
      //       massRoles,
      //     );

      //     const parentMessage = await interaction.channel.send(
      //       createMassMessage(mass),
      //     );

      //     const thread = await parentMessage.startThread({
      //       name: `${massTime} UTC ${massDate}`,
      //     });
      //     interaction.deferUpdate();
      //   }
    }
  });
};
