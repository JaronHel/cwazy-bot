import {
  ActionRowBuilder,
  ButtonBuilder,
  ChannelType,
  Client,
  ComponentType,
  Interaction,
  MessageFlags,
} from "discord.js";
import { adjustBalance, createModal, hasPermission } from "../../utils/utils";

export default async (client: Client) => {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.inGuild() || !interaction.isButton()) return;
    const guild = interaction.guild;
    if (guild === null) {
      return;
    }
    switch (interaction.customId) {
      case "editButton": {
        if (!(await hasPermission(interaction, ["Logi"], "and"))) {
          break;
        }
        const massReferenceLinkDefault =
          interaction.message.embeds[0].fields.find(
            (f) => f.name === "Mass reference link",
          )?.value;
        const itemsValueDefault = interaction.message.embeds[0].fields
          .find((f) => f.name === "Items value")
          ?.value.replaceAll(/\./g, "");
        const bagsValueDefault = interaction.message.embeds[0].fields
          .find((f) => f.name === "Bags value")
          ?.value.replaceAll(/\./g, "");
        const repairCostDefault = interaction.message.embeds[0].fields
          .find((f) => f.name === "Repair cost")
          ?.value.replaceAll(/\./g, "");
        const feeDefault = interaction.message.embeds[0].fields
          .find((f) => f.name === "Fee percentage")
          ?.value.replaceAll(/\./g, "");

        const splitModal = createModal(
          "splitModalEdit",
          massReferenceLinkDefault,
          itemsValueDefault,
          bagsValueDefault,
          repairCostDefault,
          feeDefault,
        );

        await interaction.showModal(splitModal);
        break;
      }
      case "recalculateButton": {
        if (!(await hasPermission(interaction, ["Logi"], "and"))) {
          break;
        }
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const roleField = interaction.message.embeds[0].fields.find(
          (f) => f.name === "Role assigned to the split",
        );

        const roleId = roleField?.value.match(/\d+/)?.[0];

        const role = roleId ? await guild.roles.fetch(roleId) : null;

        if (role === null) {
          await interaction.message.delete();
          break;
        }

        const netTotal = Number(
          interaction.message.embeds[0].fields
            .find((f) => f.name === "Net total")
            ?.value.replaceAll(/\./g, ""),
        );
        const newMemberCount = role.members.map((member) => member).length;
        const newSplitAmount = Math.trunc(netTotal / newMemberCount);

        const embed = interaction.message.embeds[0];

        const updatedFields = embed.fields.map((f) => {
          if (f.name === "Members in split") {
            return { ...f, value: newMemberCount.toString() };
          }

          if (f.name === "Split per member") {
            return { ...f, value: newSplitAmount.toLocaleString("de-DE") };
          }

          return f;
        });

        const newEmbed = {
          ...embed.toJSON(),
          fields: updatedFields,
        };

        await interaction.message.edit({
          embeds: [newEmbed],
        });

        await interaction.editReply({ content: "Recalculation done" });
        break;
      }
      case "confirmButton": {
        if (!(await hasPermission(interaction, ["Logi"], "and"))) {
          break;
        }
        await interaction.deferReply();

        const massField = interaction.message.embeds[0].fields.find(
          (f) => f.name === "Mass reference link",
        )?.value;

        const roleField = interaction.message.embeds[0].fields.find(
          (f) => f.name === "Role assigned to the split",
        );

        const roleId = roleField?.value.match(/\d+/)?.[0];

        const role = roleId ? await guild.roles.fetch(roleId) : null;

        if (massField === undefined || role === null) {
          await interaction.message.delete();
          break;
        }

        const balanceChannel = await client.channels.fetch(
          "1480526926073434205",
        );

        if (!balanceChannel || balanceChannel.type !== ChannelType.GuildText) {
          break;
        }

        const thread = await balanceChannel.threads.create({
          name: `${role.name}`,
          autoArchiveDuration: 60,
        });

        const membersForSplit = role.members;
        const amount =
          Number(
            interaction.message.embeds[0].fields.find(
              (f) => f.name === "Split per member",
            )?.value,
          ) ?? 0;

        thread.send(massField);
        for (const member of membersForSplit.values()) {
          const newBalance = await adjustBalance(member, amount);
          thread.send(
            `Balance of ${member.displayName} (${member.id}) adjusted for ${amount.toLocaleString("de-DE")}, new balance: ${newBalance.toLocaleString("de-DE")}`,
          );
        }
        await role.delete();
        const newComponents = interaction.message.components
          .filter((row) => row.type === ComponentType.ActionRow)
          .map((row) => {
            const newRow = new ActionRowBuilder<ButtonBuilder>();

            for (const component of row.components) {
              if (component.type === ComponentType.Button) {
                newRow.addComponents(
                  ButtonBuilder.from(component).setDisabled(true),
                );
              }
            }

            return newRow;
          });
        await interaction.message.edit({
          components: newComponents,
        });
        await interaction.editReply({
          content: `Loot split done (<#${thread.id}>)`,
        });
        break;
      }
      case "cancelButton": {
        if (!(await hasPermission(interaction, ["Logi"], "and"))) {
          break;
        }
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const field = interaction.message.embeds[0].fields.find(
          (f) => f.name === "Role assigned to the split",
        );

        const roleId = field?.value.match(/\d+/)?.[0];

        const role = roleId ? await guild.roles.fetch(roleId) : null;

        if (role === null) {
          await interaction.message.delete();
          break;
        }

        await role.delete();
        await interaction.message.delete();
        await interaction.editReply({ content: "Deleted loot split" });
        break;
      }
    }
  });
};
