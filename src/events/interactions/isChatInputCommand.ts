import {
  Client,
  EmbedBuilder,
  GuildMember,
  Interaction,
  MessageFlags,
} from "discord.js";
import { Balance } from "../../models/balance.model";
import { adjustBalance, createModal, hasPermission } from "../../utils/utils";

export default async (client: Client) => {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.inGuild() || !interaction.isChatInputCommand()) return;
    const guild = interaction.guild;
    if (guild === null) {
      return;
    }
    if (interaction.commandName === "split") {
      const sub = interaction.options.getSubcommand();
      switch (sub) {
        case "create": {
          if (!(await hasPermission(interaction, ["Logi"], "and"))) {
            break;
          }
          const splitModal = createModal("splitModal");

          await interaction.showModal(splitModal);
        }
      }
    }

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
              break;
            }

            const newBalance = await adjustBalance(member, amount);

            await interaction.reply({
              content: `Balance of ${member.displayName} (${member.id}) adjusted for ${amount.toLocaleString("de-DE")}, new balance: ${newBalance.toLocaleString("de-DE")}`,
            });
          }
          break;
        }

        case "clear": {
          if (member instanceof GuildMember) {
            if (!(await hasPermission(interaction, ["Logi"], "and"))) {
              break;
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
                content: `Cleared balance of ${(member as GuildMember).displayName} (${(member as GuildMember).id}), new balance: ${existingMember.balance.toLocaleString("de-DE")}`,
              });
            }
          }
          break;
        }

        case "cleanup": {
          if (!(await hasPermission(interaction, ["Logi"], "and"))) {
            break;
          }

          await interaction.deferReply({ flags: MessageFlags.Ephemeral });

          const balances = await Balance.find().sort({ balance: -1 });

          let exMembers = [];
          for (const b of balances) {
            try {
              await guild.members.fetch(b.discordID);
            } catch (err: any) {
              console.log(err);
              try {
                await client.users.fetch(b.discordID);
                exMembers.push(b.discordID);
              } catch (err: any) {
                console.log(err);
              }
            }
          }

          const emptyBalances = await Balance.deleteMany({
            $or: [{ balance: 0 }, { discordID: { $in: exMembers } }],
          });

          await interaction.editReply({
            content: `Deleted ${emptyBalances.deletedCount} entries from database`,
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
              const balanceOwner = await guild.members.fetch(
                existingMember.discordID,
              );
              if (balanceOwner === undefined) {
                await interaction.reply({
                  content: "Member does not exist",
                  flags: MessageFlags.Ephemeral,
                });
                break;
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
                  value: `**${existingMember.balance.toLocaleString("de-DE")}**`,
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
            const embed = new EmbedBuilder().setColor("Gold").setTimestamp();

            const members = await Promise.all(
              balances.map(async (b) => {
                try {
                  return await guild.members.fetch(b.discordID);
                } catch (err: any) {
                  return await client.users.fetch(b.discordID);
                }
              }),
            );

            let total = 0;

            balances.forEach((balance, i) => {
              embed.addFields({
                name: "\u200B",
                value: `**${i + 1}.** ${members[i].displayName} - **${balance.balance.toLocaleString("de-DE")}**`,
              });
              total += balance.balance;
            });

            embed.setTitle(
              `Balances - Total: ${total.toLocaleString("de-DE")}`,
            );

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
  });
};
