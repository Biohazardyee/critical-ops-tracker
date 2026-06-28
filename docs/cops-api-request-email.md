# Email draft — request for match-history API access

**To:** support@criticalforce.fi (or the Critical Ops support contact)
**Subject:** API access request — community-built Critical Ops stats tracker

---

Hello Critical Force team,

My name is [Your name] and I'm an independent developer. I'm building a **free,
community stats tracker for Critical Ops** — similar to the trackers competitive
players already use for VALORANT or CS2 (e.g. tracker.gg) — available both as a
website and as a Discord bot.

**What I've built so far**
Using your public endpoints (player profiles via
`…/api/public/profile` and the leaderboards via `…/api/leaderboard/*`), the app
can already:

- look up any player by name and show level, current rank, MMR, peak rank and
  clan;
- display career and **per-season** K/D, KDA and win rate for ranked, casual and
  custom;
- show the global Elite / Ranked / Kills / Clan leaderboards;
- show live server status.

**Where I'm blocked**
The public data is aggregated per season only — there is no **per-match history**
(individual match results, map, score, and per-match K/D/A). That is the single
most valuable feature for a tracker, and it's the one thing I can't build today.

**My request**
Would it be possible to get access to per-match history data for players — for
example through an official or sanctioned API endpoint, even a read-only,
rate-limited one? If such access isn't available, could you let me know whether
building on your data this way is acceptable to you, and under what conditions?

**Why I think this is valuable for Critical Ops**

- **Player engagement & retention** — detailed post-match analytics give
  competitive players a reason to keep playing, improving and coming back, the
  same loop that drives engagement in other modern FPS titles.
- **Community growth** — trackers fuel content (clips, "carry" stats, clan
  rivalries) and give creators and clans tools to showcase performance.
- **Free, additive marketing** — a polished tracker is a public-facing showcase
  of the game's competitive scene, at no cost to you.
- **No competition with your products** — it complements the game and your
  official leaderboards rather than replacing anything.

**On compliance**
I want to do this the right way. I'm happy to respect your Terms of Service,
honour any rate limits, add clear "not affiliated with Critical Force" and
attribution notices, avoid storing anything sensitive, keep the project
non-commercial, and sign a data-usage agreement if you have one. If anything I'm
currently doing isn't acceptable, just tell me and I'll adjust or take it down.

I'd be glad to share a live demo, the source code, or more details about how the
data would be used. Thank you very much for your time and for Critical Ops — and
for considering this request.

Best regards,
[Your name]
[Email / Discord]
[Project link, if you want to share one]
