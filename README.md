# AccuWeather scraper for Localnet

Reads `accuweather.com` forecasts for Localnet, a browser extension that is a personal search engine.
Localnet pulls it from here the first time it scrapes such a page, through the
[localnet-scrapers](https://github.com/opowell/localnet-scrapers) scraper source.

- `source.json`: what Localnet reads to know the scraper: its name, the URLs it reads, and the file to run.
- `accuweather.js`: the parser. It is injected into the scraped page after Localnet's DOM helpers (content-scripts/utils/dom.js) and defines `window.__dynamicParser`.
- `accuweather.test.ts`: its unit tests, run from a Localnet checkout (`pnpm parsers pull`, then `pnpm test parsers/localnet-scraper-accuweather`).
- `saved-pages/` (not in git): real pages saved from the site, which Localnet's `e2e/saved-pages.test.ts` scrapes. See Localnet's README.
  Pages can be saved with `pnpm saved-pages fetch <url>`.

## What it reads

- A place's forecast (`/en/us/new-york/10021/weather-forecast/349727`) reads as the place, its current weather (its
  temperature, RealFeel and conditions, `"12°C · RealFeel® 11° · Clear"`, then its wind, gusts and air quality,
  `"Wind: NW 10 km/h"`), the summary of the days ahead and its 10-day forecast, a block a day (`"Tue 11/17 · 14° / 6° ·
  Plenty of sun · Night: Clear · 0%"`).
- Its 10-day page (`/daily-weather-forecast/…`) reads as a block a day, with what each day's panel adds (`"RealFeel®
  13° · Max UV Index 2.0 (Low) · Wind NW 9 km/h"`).
- Their details are the place and its current temperature. They link with weight 0.2 to the place's other forecasts
  (hourly, 10-day, radar, the month).
- Any other page is left to the default parse.
