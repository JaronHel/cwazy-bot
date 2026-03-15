import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  GuildMember,
  Interaction,
  MessageFlags,
  TextChannel,
} from "discord.js";

export default async (client: Client) => {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.inGuild() || !interaction.isModalSubmit()) return;
    const guild = interaction.guild;
    if (guild === null) {
      return;
    }
    switch (interaction.customId) {
      case "splitModal": {
        if (
          interaction.channel instanceof TextChannel &&
          interaction.channel.isSendable()
        ) {
          await interaction.deferReply({});

          const massReferenceLink =
            interaction.fields.getTextInputValue("massReferenceLink");

          const discordLinkReg = /discord\.com\/channels\/\d+\/(\d+)\/(\d+)/;

          const match = discordLinkReg.exec(massReferenceLink);

          const channelId = match ? match[1] : "";
          const messageId = match ? match[2] : "";

          let membersToRole: GuildMember[] = [];
          try {
            const channel = await guild.channels.fetch(channelId);
            if (channel === null || !channel.isTextBased()) {
              throw new Error();
            }

            const message = await channel.messages.fetch(messageId);

            const mentionedMembers = message.mentions.members;

            if (mentionedMembers) {
              membersToRole = mentionedMembers.map((member) => member);
            }
          } catch (err) {
            await interaction.editReply({
              content: "Please enter a valid mass reference link",
            });
            break;
          }

          const newRole = await guild.roles.create({
            name: `split-${messageId}`,
          });

          for (let member of membersToRole) {
            guild.members.addRole({
              user: member,
              role: newRole,
            });
          }

          const itemsValue = Math.trunc(
            Number(interaction.fields.getTextInputValue("itemsValue")),
          );
          const bagsValue = Math.trunc(
            Number(interaction.fields.getTextInputValue("bagsValue")),
          );
          const repairCost = Math.trunc(
            Number(interaction.fields.getTextInputValue("repairCost")),
          );
          const fee = Math.trunc(
            Number(interaction.fields.getTextInputValue("fee")),
          );

          if (
            isNaN(itemsValue) ||
            isNaN(bagsValue) ||
            isNaN(repairCost) ||
            isNaN(fee)
          ) {
            await interaction.editReply({
              content: "Parsing to numbers failed... Please enter valid values",
            });
            break;
          }
          const totalValue = itemsValue + bagsValue;
          const totalValueAfterRepair = totalValue - repairCost;
          const calculatedFeeValue = Math.trunc(
            totalValueAfterRepair * (fee / 100),
          );
          const netTotal = totalValueAfterRepair - calculatedFeeValue;
          const membersInSplitCount = membersToRole.filter(
            (member) => !member.roles.cache.has(newRole.id),
          ).length;
          const splitPerMember = Math.trunc(netTotal / membersInSplitCount);

          const embed = new EmbedBuilder()
            .setTitle("Loot Split")
            .setColor("Blue")
            .setTimestamp()
            .setFields([
              {
                name: "Mass reference link",
                value: massReferenceLink,
                inline: false,
              },
              {
                name: "Role assigned to the split",
                value: `<@&${newRole.id}>`,
                inline: false,
              },
              {
                name: "Items value",
                value: itemsValue.toLocaleString("de-DE"),
                inline: true,
              },
              {
                name: "Bags value",
                value: bagsValue.toLocaleString("de-DE"),
                inline: true,
              },
              {
                name: "Total value",
                value: totalValue.toLocaleString("de-DE"),
                inline: true,
              },
              {
                name: "Repair cost",
                value: repairCost.toLocaleString("de-DE"),
                inline: true,
              },
              {
                name: "Total value after repair",
                value: totalValueAfterRepair.toLocaleString("de-DE"),
                inline: true,
              },
              {
                name: "Fee percentage",
                value: fee.toLocaleString("de-DE"),
                inline: true,
              },
              {
                name: "Calculated fee value",
                value: calculatedFeeValue.toLocaleString("de-DE"),
                inline: true,
              },
              {
                name: "Net total",
                value: netTotal.toLocaleString("de-DE"),
                inline: true,
              },
              {
                name: "Members in split",
                value: membersInSplitCount.toString(),
                inline: true,
              },
              {
                name: "Split per member",
                value: splitPerMember.toLocaleString("de-DE"),
                inline: false,
              },
            ]);

          const editButton = new ButtonBuilder()
            .setCustomId("editButton")
            .setLabel("Edit")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("✏️");

          const recalculateButton = new ButtonBuilder()
            .setCustomId("recalculateButton")
            .setLabel("Recalculate")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("🔄");

          const confirmButton = new ButtonBuilder()
            .setCustomId("confirmButton")
            .setLabel("Confirm")
            .setStyle(ButtonStyle.Success)
            .setEmoji("✅");

          const cancelButton = new ButtonBuilder()
            .setCustomId("cancelButton")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("🗑️");

          const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            editButton,
            recalculateButton,
            confirmButton,
            cancelButton,
          );

          await interaction.editReply({
            embeds: [embed],
            components: [row],
          });
        }
        break;
      }
      case "splitModalEdit": {
        await interaction.deferReply({
          flags: MessageFlags.Ephemeral,
        });
        if (
          interaction.channel instanceof TextChannel &&
          interaction.channel.isSendable() &&
          interaction.message !== null
        ) {
          const massReferenceLink =
            interaction.fields.getTextInputValue("massReferenceLink");

          const discordLinkReg = /discord\.com\/channels\/\d+\/(\d+)\/(\d+)/;

          const match = discordLinkReg.exec(massReferenceLink);

          const channelId = match ? match[1] : "";
          const messageId = match ? match[2] : "";

          let membersToRole: GuildMember[] = [];
          try {
            const channel = await guild.channels.fetch(channelId);
            if (channel === null || !channel.isTextBased()) {
              throw new Error();
            }

            const message = await channel.messages.fetch(messageId);

            const mentionedMembers = message.mentions.members;

            if (mentionedMembers) {
              membersToRole = mentionedMembers.map((member) => member);
            }
          } catch (err) {
            await interaction.editReply({
              content: "Please enter a valid mass reference link",
            });
            break;
          }

          const field = interaction.message.embeds[0].fields.find(
            (f) => f.name === "Role assigned to the split",
          );

          const roleId = field?.value.match(/\d+/)?.[0];

          const oldRole = roleId ? await guild.roles.fetch(roleId) : null;
          await oldRole?.delete();

          const newRole = await guild.roles.create({
            name: `split-${messageId}`,
          });
          for (let member of membersToRole) {
            guild.members.addRole({
              user: member,
              role: newRole,
            });
          }

          const itemsValue = Math.trunc(
            Number(interaction.fields.getTextInputValue("itemsValue")),
          );
          const bagsValue = Math.trunc(
            Number(interaction.fields.getTextInputValue("bagsValue")),
          );
          const repairCost = Math.trunc(
            Number(interaction.fields.getTextInputValue("repairCost")),
          );
          const fee = Math.trunc(
            Number(interaction.fields.getTextInputValue("fee")),
          );

          if (
            isNaN(itemsValue) ||
            isNaN(bagsValue) ||
            isNaN(repairCost) ||
            isNaN(fee)
          ) {
            await interaction.editReply({
              content: "Parsing to numbers failed... Please enter valid values",
            });
            break;
          }
          const totalValue = itemsValue + bagsValue;
          const totalValueAfterRepair = totalValue - repairCost;
          const calculatedFeeValue = Math.trunc(
            totalValueAfterRepair * (fee / 100),
          );
          const netTotal = totalValueAfterRepair - calculatedFeeValue;
          const membersInSplitCount = membersToRole.filter(
            (member) => !member.roles.cache.has(newRole.id),
          ).length;
          const splitPerMember = Math.trunc(netTotal / membersInSplitCount);

          const embed = new EmbedBuilder()
            .setTitle("Loot Split")
            .setColor("Blue")
            .setTimestamp()
            .setFields([
              {
                name: "Mass reference link",
                value: massReferenceLink,
                inline: false,
              },
              {
                name: "Role assigned to the split",
                value: `<@&${newRole.id}>`,
                inline: false,
              },
              {
                name: "Items value",
                value: itemsValue.toLocaleString("de-DE"),
                inline: true,
              },
              {
                name: "Bags value",
                value: bagsValue.toLocaleString("de-DE"),
                inline: true,
              },
              {
                name: "Total value",
                value: totalValue.toLocaleString("de-DE"),
                inline: true,
              },
              {
                name: "Repair cost",
                value: repairCost.toLocaleString("de-DE"),
                inline: true,
              },
              {
                name: "Total value after repair",
                value: totalValueAfterRepair.toLocaleString("de-DE"),
                inline: true,
              },
              {
                name: "Fee percentage",
                value: fee.toLocaleString("de-DE"),
                inline: true,
              },
              {
                name: "Calculated fee value",
                value: calculatedFeeValue.toLocaleString("de-DE"),
                inline: true,
              },
              {
                name: "Net total",
                value: netTotal.toLocaleString("de-DE"),
                inline: true,
              },
              {
                name: "Members in split",
                value: membersInSplitCount.toString(),
                inline: true,
              },
              {
                name: "Split per member",
                value: splitPerMember.toLocaleString("de-DE"),
                inline: false,
              },
            ]);

          await interaction.message?.edit({
            embeds: [embed],
          });
        }
        await interaction.editReply({
          content: "Loot split edited",
        });
        break;
      }
    }
  });
};
