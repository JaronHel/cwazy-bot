import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  Collection,
  GuildMember,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  Role,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { Balance } from "../models/balance.model";

export function createModal(
  modalId: string,
  massReferenceLinkDefault: string = "",
  itemsValueDefault: string = "",
  bagsValueDefault: string = "",
  repairCostDefault: string = "",
  feeDefault: string = "",
) {
  const massReferenceLink = new TextInputBuilder()
    .setCustomId("massReferenceLink")
    .setStyle(TextInputStyle.Short)
    .setValue(massReferenceLinkDefault)
    .setRequired(true);
  const massReferenceLinkLabel = new LabelBuilder()
    .setLabel("Mass reference link")
    .setTextInputComponent(massReferenceLink);

  const itemsValue = new TextInputBuilder()
    .setCustomId("itemsValue")
    .setStyle(TextInputStyle.Short)
    .setValue(itemsValueDefault)
    .setRequired(true);
  const itemsValueLabel = new LabelBuilder()
    .setLabel("Items value")
    .setTextInputComponent(itemsValue);

  const bagsValue = new TextInputBuilder()
    .setCustomId("bagsValue")
    .setStyle(TextInputStyle.Short)
    .setValue(bagsValueDefault)
    .setRequired(true);
  const bagsValueLabel = new LabelBuilder()
    .setLabel("Bags value")
    .setTextInputComponent(bagsValue);

  const repairCost = new TextInputBuilder()
    .setCustomId("repairCost")
    .setStyle(TextInputStyle.Short)
    .setValue(repairCostDefault)
    .setRequired(true);
  const repairCostLabel = new LabelBuilder()
    .setLabel("Repair cost")
    .setTextInputComponent(repairCost);

  const fee = new TextInputBuilder()
    .setCustomId("fee")
    .setStyle(TextInputStyle.Short)
    .setValue(feeDefault)
    .setRequired(true);
  const feeLabel = new LabelBuilder()
    .setLabel("Fee in percentage")
    .setTextInputComponent(fee);

  const splitModal = new ModalBuilder()
    .setCustomId(modalId)
    .setTitle("Split Creator")
    .setLabelComponents(
      massReferenceLinkLabel,
      itemsValueLabel,
      bagsValueLabel,
      repairCostLabel,
      feeLabel,
    );

  return splitModal;
}

export async function adjustBalance(member: GuildMember, amount: number) {
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

  return newBalance;
}

export async function hasPermission(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  roles: string[],
  mode: "and" | "or",
): Promise<boolean> {
  const memberRoles = new Collection<string, Role>(
    // TODO FIX CACHE
    (interaction.member as GuildMember).roles.cache.map((role) => [
      role.name,
      role,
    ]),
  );

  const hasPermission =
    mode === "and"
      ? memberRoles.hasAll(...roles)
      : memberRoles.hasAny(...roles);

  if (!hasPermission) {
    interaction.reply({
      content: "No permission!",
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  return true;
}
