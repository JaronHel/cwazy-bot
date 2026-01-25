import {
  APIActionRowComponent,
  APIModalInteractionResponseCallbackData,
  APITextInputComponent,
  Client,
  ComponentType,
  GuildMember,
  MessageFlags,
  TextChannel,
  TextInputStyle,
} from "discord.js";
import { Mass } from "../classes/mass";
import { createMassMessage } from "../messages/massMessage";
import { Balance } from "../models/balance.model";

export default async (client: Client) => {
  client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {
      // help
      if (interaction.commandName === "help") {
        await interaction.reply({
          content: "Help commands",
          flags: MessageFlags.Ephemeral,
        });
      }

      // party
      if (interaction.commandName === "mass") {
        const sub = interaction.options.getSubcommand();

        // create
        if (sub === "create") {
          const massTime: APITextInputComponent = {
            type: ComponentType.TextInput,
            custom_id: "massTime",
            label: "Enter mass time in UTC",
            placeholder: "18",
            style: TextInputStyle.Short,
            required: true,
          };

          const massDate: APITextInputComponent = {
            type: ComponentType.TextInput,
            custom_id: "massDate",
            label: "Enter mass date",
            placeholder: new Date().toLocaleDateString(),
            style: TextInputStyle.Short,
            required: true,
          };

          const massLocation: APITextInputComponent = {
            type: ComponentType.TextInput,
            custom_id: "massLocation",
            label: "Enter mass location",
            placeholder: "Lymhurst Portal",
            style: TextInputStyle.Short,
            required: true,
          };

          const massContent: APITextInputComponent = {
            type: ComponentType.TextInput,
            custom_id: "massContent",
            label: "Enter content description",
            placeholder: "Wipe some shitters in portal zone",
            style: TextInputStyle.Paragraph,
            required: true,
          };

          const massRoles: APITextInputComponent = {
            type: ComponentType.TextInput,
            custom_id: "massRoles",
            label: "Enter roles",
            placeholder: "Hallowfall\nGA\nLongbow",
            style: TextInputStyle.Paragraph,
            required: true,
          };

          const TextInputRows: APIActionRowComponent<APITextInputComponent>[] =
            [
              { type: ComponentType.ActionRow, components: [massTime] },
              { type: ComponentType.ActionRow, components: [massDate] },
              { type: ComponentType.ActionRow, components: [massLocation] },
              { type: ComponentType.ActionRow, components: [massContent] },
              { type: ComponentType.ActionRow, components: [massRoles] },
            ];

          const massCreateModal: APIModalInteractionResponseCallbackData = {
            custom_id: "massCreateModal",
            title: "Create mass",
            components: TextInputRows,
          };

          await interaction.showModal(massCreateModal);
        }
      }
      if (interaction.commandName === "balance") {
        const sub = interaction.options.getSubcommand();
        const member = interaction.options.getMember("member");
        const amount = interaction.options.getInteger("amount");

        switch (sub) {
          case "adjust": {
            if (
              !(interaction.member as GuildMember).roles.cache.some(
                (role) => role.name === "Logi",
              )
            ) {
              return;
            }

            if (
              member instanceof GuildMember &&
              amount != null &&
              !isNaN(Number(amount))
            ) {
              const existingMember = await Balance.findOne({
                discordID: member.id,
              });

              let newBalance = 0;

              if (existingMember === null) {
                const newMember = await Balance.create({
                  discordID: member.id,
                  balance: Number(amount),
                });
                newBalance = newMember.balance;
              } else {
                existingMember.balance += Number(amount);
                await existingMember.save();
                newBalance = existingMember.balance;
              }
              await interaction.reply({
                content: `Balance of ${member.displayName} (${member.id}) adjusted, new balance: ${newBalance}`,
                flags: MessageFlags.Ephemeral,
              });
            }
            break;
          }

          case "show": {
            if (member instanceof GuildMember) {
              const existingMember = await Balance.findOne({
                discordID: member.id,
              });

              if (existingMember === null) {
                await interaction.reply({
                  content: `Member ${member.displayName} (${member.id}) doesn't have balance yet`,
                  flags: MessageFlags.Ephemeral,
                });
              } else {
                await interaction.reply({
                  content: `Current balance of ${member.displayName} (${member.id}): ${existingMember.balance}`,
                  flags: MessageFlags.Ephemeral,
                });
              }
            }
            break;
          }
        }
      }
    } else if (interaction.isModalSubmit()) {
      if (
        interaction.customId === "massCreateModal" &&
        interaction.channel instanceof TextChannel &&
        interaction.channel.isSendable()
      ) {
        const massTime = interaction.fields.getTextInputValue("massTime");
        const massDate = interaction.fields.getTextInputValue("massDate");
        const massLocation =
          interaction.fields.getTextInputValue("massLocation");
        const massContent = interaction.fields.getTextInputValue("massContent");
        const massRoles = interaction.fields.getTextInputValue("massRoles");
        const mass = new Mass(
          massTime,
          massDate,
          massLocation,
          massContent,
          massRoles,
        );

        const parentMessage = await interaction.channel.send(
          createMassMessage(mass),
        );

        const thread = await parentMessage.startThread({
          name: `${massTime} UTC ${massDate}`,
        });
        interaction.deferUpdate();
      }
    }
  });
};
