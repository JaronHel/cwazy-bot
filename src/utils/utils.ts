import {
  CacheType,
  ChatInputCommandInteraction,
  Collection,
  GuildMember,
  MessageFlags,
  Role,
} from "discord.js";

export async function hasPermission(
  interaction: ChatInputCommandInteraction<CacheType>,
  roles: string[],
  mode: "and" | "or",
): Promise<boolean> {
  if (!interaction.inGuild()) {
    interaction.reply({
      content: "This command can only be used in a server.",
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

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
