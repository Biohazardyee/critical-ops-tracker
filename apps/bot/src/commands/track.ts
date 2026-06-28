import {
  SlashCommandBuilder,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import {
  CopsClient,
  PlayerNotFoundError,
  summarizeProfile,
  type DerivedModeStats,
} from "@cops/core";

const cops = new CopsClient();

export const data = new SlashCommandBuilder()
  .setName("track")
  .setDescription("Show Critical Ops stats for a player")
  .addStringOption((o) =>
    o
      .setName("pseudo")
      .setDescription("In-game name")
      .setRequired(true),
  );

const pct = (n: number): string => `${(n * 100).toFixed(1)}%`;

const modeLine = (m: DerivedModeStats): string =>
  `K/D **${m.kd}** · KDA **${m.kda}** · WR **${pct(m.winrate)}**\n` +
  `${m.k}K / ${m.d}D / ${m.a}A · ${m.w}W-${m.l}L`;

export async function execute(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const name = interaction.options.getString("pseudo", true);
  await interaction.deferReply();
  try {
    const profile = await cops.getProfileByName(name);
    const s = summarizeProfile(profile);

    const embed = new EmbedBuilder()
      .setColor(s.rank.color as `#${string}`)
      .setTitle(`${s.name}${s.clan ? ` [${s.clan.tag}]` : ""}`)
      .setDescription(
        `Level **${s.level}** · Rank **${s.rank.name}** · MMR **${s.mmr}**`,
      )
      .addFields(
        { name: "🏆 Ranked (career)", value: modeLine(s.career.ranked) },
        { name: "🎮 Casual (career)", value: modeLine(s.career.casual) },
        { name: "🛠️ Custom (career)", value: modeLine(s.career.custom) },
      )
      .setFooter({
        text:
          `User ID ${s.userId}` +
          (s.leaderboardPosition
            ? ` · Leaderboard #${s.leaderboardPosition}`
            : ""),
      });

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    const message =
      err instanceof PlayerNotFoundError
        ? err.message
        : "Failed to fetch stats from the Critical Ops API. Try again later.";
    await interaction.editReply({ content: `⚠️ ${message}` });
  }
}
