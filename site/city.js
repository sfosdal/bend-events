// The city — every fact that makes this calendar Bend's rather than
// another town's, in one place (2026-10-21: built on the Salem site's
// pattern). The browser (filter.js, app.js) and the build (scripts/*.mjs)
// both read it; nothing else names a venue or a team. The shared files
// (app.js, filter.js, styles.css bar its --v-* hues, scripts/*.mjs bar
// fetch-events.mjs and sources.mjs) are lqa-events' own, byte for byte —
// see README "Sister sites".
//
// Loaded before filter.js (a plain script, so the tests can share it): it
// sets globalThis.LQACity (the name is the shared code's, not the city's).
(function (global) {
  'use strict';

  // The home teams, matched on the event title whatever the venue. Order =
  // the Teams strip, left to right. Bend has no club of its own on any
  // feed (the Elks' West Coast League season has no published schedule
  // feed — their Squarespace schedule page is empty between seasons), so
  // these are the state's campus clubs the high desert follows — Oregon
  // State, which runs OSU-Cascades in Bend, then Oregon — as a
  // Teams-view-only list: their grounds are not venues here and there is
  // no `inject` (the Port Angeles pattern). Per team:
  //   re        the title match; venue the home building; sport keys the
  //             strip icon and the game clock; colors [primary, accent];
  //   season / form  where the schedule and the record come from (ESPN)
  //   club      the club's name on Ticketmaster; wiki the article; opens
  //             when the season usually starts
  var TEAMS = [
    // Oregon State Beavers football, Pac-12, Reser Stadium (Corvallis) — Ticketmaster lists the home Saturdays
    { slug: 'beavers', label: 'Beavers', name: 'Oregon State Beavers', abbr: 'ORST', re: /oregon state (beavers )?football|\bbeavers\b(?!.*(basketball|volleyball|softball|soccer|baseball|wrestling|gymnastics))/i, sport: 'football', venue: 'Reser Stadium', colors: ['#dc4405', '#000000'],
      espn: { sport: 'football', league: 'college-football', id: '204' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/204.png', schedule: 'https://osubeavers.com/sports/football/schedule',
      club: 'Oregon State Beavers Football', opens: 'late August', wiki: { title: 'Oregon State Beavers football', teamPage: true } },
    // Oregon State Beavers men's basketball, Pac-12, Gill Coliseum — Ticketmaster lists the home games
    { slug: 'beaversbasketball', label: 'Beavers Basketball', name: 'Oregon State Beavers', abbr: 'ORST', re: /oregon state (beavers )?men'?s basketball|oregon state (beavers )?basketball(?!.*women)/i, sport: 'basketball', venue: 'Gill Coliseum', colors: ['#dc4405', '#000000'],
      espn: { sport: 'basketball', league: 'mens-college-basketball', id: '204' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/204.png', schedule: 'https://osubeavers.com/sports/mens-basketball/schedule',
      club: "Oregon State Beavers Men's Basketball", opens: 'early November', wiki: { title: "Oregon State Beavers men's basketball", teamPage: true } },
    // Oregon Ducks football, Big Ten, Autzen Stadium — Ticketmaster lists the home Saturdays
    { slug: 'ducks', label: 'Ducks', name: 'Oregon Ducks', abbr: 'ORE', re: /oregon (ducks )?football|\bducks\b(?!.*(basketball|volleyball|softball|soccer|baseball|track))/i, sport: 'football', venue: 'Autzen Stadium', colors: ['#154733', '#fee123'],
      espn: { sport: 'football', league: 'college-football', id: '2483' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2483.png', schedule: 'https://goducks.com/sports/football/schedule',
      club: 'Oregon Ducks Football', opens: 'late August', wiki: { title: 'Oregon Ducks football', teamPage: true } },
    // Oregon Ducks men's basketball, Big Ten, Matthew Knight Arena — Ticketmaster lists the home games
    { slug: 'ducksbasketball', label: 'Ducks Basketball', name: 'Oregon Ducks', abbr: 'ORE', re: /oregon (ducks )?men'?s basketball|oregon (ducks )?basketball(?!.*women)/i, sport: 'basketball', venue: 'Matthew Knight Arena', colors: ['#154733', '#fee123'],
      espn: { sport: 'basketball', league: 'mens-college-basketball', id: '2483' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2483.png', schedule: 'https://goducks.com/sports/mens-basketball/schedule',
      club: "Oregon Ducks Men's Basketball", opens: 'early November', wiki: { title: "Oregon Ducks men's basketball", teamPage: true } },
    // Oregon Ducks women's basketball, Big Ten, Matthew Knight Arena — Ticketmaster lists the home games
    { slug: 'duckswomens', label: 'Ducks Women', name: 'Oregon Ducks', abbr: 'ORE', re: /oregon (ducks )?women'?s basketball/i, sport: 'basketball', venue: 'Matthew Knight Arena', colors: ['#fee123', '#154733'],
      espn: { sport: 'basketball', league: 'womens-college-basketball', id: '2483' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2483.png', schedule: 'https://goducks.com/sports/womens-basketball/schedule',
      club: "Oregon Ducks Women's Basketball", opens: 'early November', wiki: { title: "Oregon Ducks women's basketball", teamPage: true } },
  ];

  // The venues, one record each, by size. Per venue:
  //   capacity how many people the place holds
  //   area     absent = Bend proper; 'town' = Sisters and Redmond, the panel's second group
  //   type     the event type when the title decides nothing
  //   cssVar   the hue styles.css sets for it (dark block --v-*); color
  //            the same hue as a value, for the series graph
  //   url      the venue's own events listing — not a ticket vendor
  //   icon     a mark for listings without a team crest
  //   tm       its Ticketmaster Discovery listing (fetch-events.mjs reads
  //            the venue by id — every page; several ids comma-joined read as
  //            one). exclude drops the parking, suites, tours and bundles;
  //            secondary: true makes the listing a second source behind the
  //            room's own calendar (the Eugene pattern)
  //   alias    the other spellings the feeds use for it, folded to this name
  //   feed     the room's own calendar, read by scripts/feeds.mjs
  // Scouted and left out (README "Sources scouted"): the Old Mill District's
  // calendar (279 rows, nearly all shop and restaurant nights), BendFilm (its
  // feed lists nothing), the High Desert Museum (no listing in the page),
  // Cascades Theatrical (Arts-People box office, no feed kind yet), 2nd
  // Street Theater, The Commons (Wix + Eventbrite), Sunriver Music, the
  // Deschutes expo's own calendar (403), bendticket.com (403), Stranger
  // Tickets (two Bend rows, a saloon) and the Bend Elks (no schedule feed).
  var TM_EXCLUDE = /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass|all[- ]session|mini[- ]plan|lawn chair|cabana/i;
  var VENUES = {
    // --- Bend: the Old Mill amphitheatre, the Tower, the Midtown rooms, the pubs, the ballpark ---
    'Hayden Homes Amphitheater': { // the 8,000-capacity summer shed on the Deschutes in the Old Mill District — the season runs May to September
      capacity: 8000,
      type: 'concert',
      cssVar: '--v-hayden',
      color: '#86c8ea',
      url: 'https://www.bendconcerts.com/',
      icon: 'https://www.google.com/s2/favicons?domain=www.bendconcerts.com&sz=128',
      tm: { id: 'KovZpZA1vlIA', match: '', fallbackUrl: 'https://www.bendconcerts.com/', exclude: TM_EXCLUDE },
      alias: /hayden homes amph|les schwab amph/i,
    },
    'Vince Genna Stadium': { // the Bend Elks' ballpark on Roosevelt Avenue — summer collegiate baseball (West Coast League)
      capacity: 3500,
      type: 'sports',
      cssVar: '--v-vincegenna',
      color: '#86ea86',
      url: 'https://www.bendelks.com/vince-genna-stadium',
      icon: 'https://www.google.com/s2/favicons?domain=www.bendelks.com&sz=128',
      tm: { id: 'Z7r9jZad5i', match: '', fallbackUrl: 'https://www.bendelks.com/', exclude: TM_EXCLUDE },
      alias: /vince genna/i,
    },
    'Midtown Ballroom': { // the Midtown Events Center's big room on NE Franklin — Ticketmaster and TicketWeb list different shows, so both ids are read
      capacity: 1000,
      type: 'concert',
      cssVar: '--v-midtown',
      color: '#c886ea',
      url: 'https://www.midtownbend.com/',
      icon: 'https://www.google.com/s2/favicons?domain=www.midtownbend.com&sz=128',
      tm: { id: 'ZFr9jZ1eF6,KovZpZAEJE1A', match: '', fallbackUrl: 'https://www.midtownbend.com/', exclude: TM_EXCLUDE },
      alias: /midtown ballroom/i,
    },
    'Tower Theatre': { // the 1940 Art Deco movie house on Wall Street, a nonprofit stage since 2004 — its own calendar (`cards`) leads, Ticketmaster second
      capacity: 440,
      type: 'arts',
      cssVar: '--v-tower',
      color: '#ea8686',
      url: 'https://www.towertheatre.org/events/',
      icon: 'https://www.google.com/s2/favicons?domain=www.towertheatre.org&sz=128',
      tm: { id: 'ZFr9jZkaA7', match: '', fallbackUrl: 'https://www.towertheatre.org/events/', exclude: TM_EXCLUDE, secondary: true }, // KovZpZA1tIdA lists the same shows
      feed: { kind: 'cards', url: 'https://www.towertheatre.org/events/', item: '<div role="listitem" class="upcoming_events_list_item', title: /<a href="(\/event\/[^"]+)" class="events_card-heading-link[^>]*><h3[^>]*>([^<]+)</, when: /events_card-extract">([^<]+)<\/div><div class="events_card-concat-text">@<\/div><div class="events_card-extract">([^<]+)</, drop: /gift card|rental|private event/i },
      alias: /tower theatre/i,
    },
    'Domino Room': { // the Midtown Events Center's small room — Ticketmaster under one id that carries the others' shows
      capacity: 400,
      type: 'concert',
      cssVar: '--v-domino',
      color: '#eac886',
      url: 'https://www.midtownbend.com/',
      icon: 'https://www.google.com/s2/favicons?domain=www.midtownbend.com&sz=128',
      tm: { id: 'KovZpZAFIatA', match: '', fallbackUrl: 'https://www.midtownbend.com/', exclude: TM_EXCLUDE },
      alias: /domino room/i,
    },
    'Volcanic Theatre Pub': { // the Century Drive pub-and-stage — touring bands, comedy, burlesque
      capacity: 300,
      type: 'concert',
      cssVar: '--v-volcanic',
      color: '#eaa786',
      url: 'https://volcanictheatre.com/',
      icon: 'https://www.google.com/s2/favicons?domain=volcanictheatre.com&sz=128',
      tm: { id: 'Z7r9jZadIa', match: '', fallbackUrl: 'https://volcanictheatre.com/', exclude: TM_EXCLUDE }, // KovZ917AYa9 lists the same shows
      alias: /volcanic theat/i,
    },
    'Silver Moon Brewing': { // the brewery's stage on Hawthorne Avenue
      capacity: 300,
      type: 'concert',
      cssVar: '--v-silvermoon',
      color: '#8696ea',
      url: 'https://www.silvermoonbrewing.com/',
      icon: 'https://www.google.com/s2/favicons?domain=www.silvermoonbrewing.com&sz=128',
      tm: { id: 'rZ7HnEZ174bvb', match: '', fallbackUrl: 'https://www.silvermoonbrewing.com/', exclude: TM_EXCLUDE },
      alias: /silver moon/i,
    },
    'Old St. Francis School': { // McMenamins' 1936 schoolhouse downtown — the Deschutes Historical Museum's History Pub talks (`tribe`)
      capacity: 150,
      type: 'community',
      cssVar: '--v-stfrancis',
      color: '#ea86d9',
      url: 'https://www.deschuteshistory.org/events/',
      icon: 'https://www.google.com/s2/favicons?domain=www.deschuteshistory.org&sz=128',
      feed: { kind: 'tribe', url: 'https://www.deschuteshistory.org/wp-json/tribe/events/v1/events', drop: /museum closed|volunteer|rental/i },
      alias: /st\.? francis/i,
    },
    // --- Sisters and Redmond ---
    'Deschutes County Expo Center': { // the fairgrounds in Redmond — the county fair, the rodeos, the expos and the First Interstate Bank Center's arena shows
      capacity: 6000,
      type: 'community',
      area: 'town',
      cssVar: '--v-expo',
      color: '#eae186',
      url: 'https://expo.deschutes.org/',
      icon: 'https://www.google.com/s2/favicons?domain=expo.deschutes.org&sz=128',
      tm: { id: 'KovZpa34Oe,rZ7HnEZ17oxPA', match: '', fallbackUrl: 'https://expo.deschutes.org/', exclude: TM_EXCLUDE },
      alias: /deschutes county (fair|expo)|first interstate bank center/i,
    },
    'The Belfry': { // the old church hall in Sisters — touring roots and folk acts (`tribe`)
      capacity: 300,
      type: 'concert',
      area: 'town',
      cssVar: '--v-belfry',
      color: '#86eac8',
      url: 'https://www.belfryevents.com/',
      icon: 'https://www.google.com/s2/favicons?domain=www.belfryevents.com&sz=128',
      feed: { kind: 'tribe', url: 'https://www.belfryevents.com/wp-json/tribe/events/v1/events', drop: /rental|private event|volunteer/i },
      alias: /\bbelfry\b/i,
    },
  };

  // City-wide feeds (scripts/feeds.mjs): none — every listing is read by room
  var FEEDS = [];

  // The usual view: every room on
  var DEFAULT_ON = ['Hayden Homes Amphitheater', 'Vince Genna Stadium', 'Midtown Ballroom', 'Tower Theatre', 'Domino Room', 'Volcanic Theatre Pub', 'Silver Moon Brewing', 'Old St. Francis School', 'Deschutes County Expo Center', 'The Belfry'];
  var DEFAULT_OFF = [];
  var PREFS_KNOWN_FROM = null; // no default-off venue yet, so nothing for saved prefs to be told about

  // Event types: every event lands in exactly one, from its flags, title,
  // then venue. The rows the panel shows, in order.
  var TYPES = [
    { key: 'concert', label: 'Concerts', title: 'Live music — the Hayden Homes Amphitheater, the Midtown rooms, the Volcanic, the Belfry in Sisters' },
    { key: 'sports', label: 'Sports', title: 'The Elks’ ballpark, and the Beavers and the Ducks' },
    { key: 'arts', label: 'Arts & Theater', title: 'The Tower Theatre — comedy, dance, film and the touring shows' },
    { key: 'community', label: 'Community', title: 'The Redmond fairgrounds — the county fair, rodeos, expos — and the History Pub talks' },
  ];
  var MOVIE_VENUE = null; // no cinema here

  // Share codes (?f=CODE): REGISTRY is every filterable key in a fixed
  // order and a code is a bitmask over it, so the list is APPEND-ONLY —
  // adding an entry adds a bit and every existing code keeps meaning what
  // it meant; removing or reordering one changes every link out there.
  // 23 slots from the first build: 5 base-36 digits.
  var CODE_LENGTH = 5;
  var REGISTRY = [
    ['venue', 'Hayden Homes Amphitheater'], ['venue', 'Vince Genna Stadium'], ['venue', 'Midtown Ballroom'], ['venue', 'Tower Theatre'], ['venue', 'Domino Room'], ['venue', 'Volcanic Theatre Pub'], ['venue', 'Silver Moon Brewing'], ['venue', 'Old St. Francis School'], ['venue', 'Deschutes County Expo Center'], ['venue', 'The Belfry'],
    ['badge', 'concert'], ['badge', 'sports'], ['badge', 'arts'], ['badge', 'community'],
    ['team', 'beavers'], ['team', 'beaversbasketball'], ['team', 'ducks'], ['team', 'ducksbasketball'], ['team', 'duckswomens'],
    ['cap', 'stadium'], ['cap', 'arena'], ['cap', 'hall'], ['cap', 'room'],
  ];

  // The words the page uses for the place
  var WORDS = {
    teamCity: 'Bend', // the board drops it from the clubs' names
    presetDefault: 'Every room — the Hayden Homes Amphitheater, the Tower, the Midtown rooms, the pubs, the ballpark, the Belfry in Sisters and the Redmond fairgrounds — every team and type',
    presetNeighborhood: 'Bend proper only — the amphitheatre, the Tower, the Midtown Ballroom and Domino Room, the Volcanic, Silver Moon, Old St. Francis and the ballpark',
    presetBig: 'Only the places that hold 2,000 or more — the Hayden Homes Amphitheater, Vince Genna Stadium and the Redmond fairgrounds',
    phrases: { all: 'Showing everything.', none: 'Showing nothing yet — open Filter and pick some venues.', neighborhood: 'Showing Bend proper only.', big: 'Showing the big rooms only — the amphitheatre, the ballpark and the Redmond fairgrounds.' },
  };

  // Oregon's public holidays (app.js holidaysFor reads this instead of its
  // Seattle list): the federal set without Columbus Day, which Oregon does
  // not observe.
  function nthWeekday(y, month, weekday, n) { var d = new Date(y, month, 1); while (d.getDay() !== weekday) d.setDate(d.getDate() + 1); d.setDate(d.getDate() + (n - 1) * 7); return d; }
  function lastMonday(y, month) { var d = new Date(y, month + 1, 0); while (d.getDay() !== 1) d.setDate(d.getDate() - 1); return d; }
  var HOLIDAYS = function (y) {
    return [
      [new Date(y, 0, 1), "New Year's Day"],
      [nthWeekday(y, 0, 1, 3), 'Martin Luther King Jr. Day'],
      [nthWeekday(y, 1, 1, 3), "Presidents' Day"],
      [lastMonday(y, 4), 'Memorial Day'],
      [new Date(y, 5, 19), 'Juneteenth'],
      [new Date(y, 6, 4), 'Independence Day'],
      [nthWeekday(y, 8, 1, 1), 'Labor Day'],
      [new Date(y, 10, 11), 'Veterans Day'],
      [nthWeekday(y, 10, 4, 4), 'Thanksgiving'],
      [new Date(y, 11, 25), 'Christmas Day'],
    ];
  };

  global.LQACity = {
    key: 'bend',
    name: 'Bend',
    site: 'https://bend.here.events/',
    userAgent: 'Mozilla/5.0 (compatible; bend-events/1.0; +https://bend.here.events/)',
    tz: 'America/Los_Angeles', tzName: 'Pacific', // the city's time zone: the ICS feed's TZID, the game clocks, the poster's footer
    state: 'Oregon', stateOutline: null, // no state drawing (the masthead's state strip went away 2026-10-13)
    // the calendar feed's header; the UID domain never changes (changing it
    // re-creates every event in subscribers' calendars)
    ics: { name: 'Bend Events', short: 'Bend Events', teams: 'Central Oregon teams — every season', prodid: '-//here.events//bend-events//EN', uidDomain: 'fosdal.net', // the UID domain the whole family issues (the shared ics test pins it)
      desc: 'Upcoming events in Bend\, OR — the Hayden Homes Amphitheater\, the Tower Theatre\, the Midtown Ballroom and Domino Room\, the Volcanic Theatre Pub\, Silver Moon\, Vince Genna Stadium\, the Belfry in Sisters and the Redmond fairgrounds' },
    teams: TEAMS,
    venues: VENUES,
    feeds: FEEDS,
    defaultOn: DEFAULT_ON,
    defaultOff: DEFAULT_OFF,
    prefsKnownFrom: PREFS_KNOWN_FROM,
    types: TYPES,
    movieVenue: MOVIE_VENUE,
    groundsVenue: null, // every listing is read by room (or pinned to one), so nothing arrives under a name city.js lacks
    codeLength: CODE_LENGTH,
    registry: REGISTRY,
    words: WORDS,
    holidays: HOLIDAYS,
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
