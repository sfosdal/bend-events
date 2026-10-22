# Bend Events

Event feed and calendar for Bend, Oregon: the Hayden Homes Amphitheater in the
Old Mill District, the Tower Theatre, the Midtown Ballroom and Domino Room, the
Volcanic Theatre Pub, Silver Moon Brewing, the History Pub talks at Old
St. Francis and the Elks' ballpark (Vince Genna Stadium), with the Belfry in
Sisters and the Deschutes County Expo Center in Redmond as the "Sisters &
Redmond" group — and the state's campus clubs (Beavers football and
basketball, Ducks football, men's and women's basketball) in a Teams view.

To be published at **https://bend.here.events/** (GitHub Pages, built by the
Actions workflow once a day at noon Pacific).

Built 2026-10-21 on the family's city pattern (template: salem-events).
Everything that makes this Bend's is `site/city.js` (every team, venue, type,
default, share-code registry, holiday and string), `site/index.html`,
`scripts/fetch-events.mjs` (its source list), `site/embed.js`, `outlook.json`,
`scripts/data/postseason.json`, `channels.json`, the manifest and icons.
Everything else — `app.js`, `filter.js`, `styles.css` bar its `--v-*` hue
lines, the shared `scripts/*.mjs` and their tests — is lqa-events' own, byte
for byte, copied in by `sync-shared.sh` from the lqa-events project.

## Sources

- **Ticketmaster Discovery API** — the rooms Ticketmaster lists, each by its
  venue id (every page; the Midtown Ballroom reads its Ticketmaster and
  TicketWeb ids, the Redmond expo its fairgrounds and arena ids). Parking,
  suites, tours, VIP upgrades and season bundles are dropped per room
  (`tm.exclude`). Church events are left out (`isChurch`).
- **Tower Theatre** — its own events page (`scripts/feeds.mjs` kind `cards`,
  the Webflow card list), with Ticketmaster as a secondary source that fills
  only the dates the page lacks (`tm.secondary`).
- **The Belfry** (Sisters) and the **Deschutes Historical Museum** (History
  Pub at McMenamins Old St. Francis) — their Events Calendar REST feeds (kind
  `tribe`).
- **Seasons** — ESPN for the Beavers and the Ducks (Teams view only: their
  grounds are not venues here). The Bend Elks (West Coast League) have no
  schedule feed; their ballpark is a room, read from Ticketmaster.

## Build

```
cp .env.example .env   # TICKETMASTER_API_KEY=… (a free Discovery key)
ALLOW_NO_ARCHIVE=1 node scripts/fetch-events.mjs   # writes site/events.json, the .ics feeds, teams.json
node --test scripts/*.test.mjs
python3 -m http.server 8000 --directory site
```

`ALLOW_NO_ARCHIVE=1` is only for the first build, before the `events-archive`
branch exists; in CI the workflow sets it as a repository variable until the
first run has pushed the archive, then it is deleted.

## Sister sites

lqa-events (Seattle Center) is the source of truth for the shared files. See
its README for the pipeline, the share codes and the Teams view.
