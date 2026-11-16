import { afterEach, describe, expect, it } from 'vitest'
import { parserLoader, resetPage, visit } from '#scraper-test'

// The parser, evaluated with the helpers it is injected with, as a scrape runs it.
const load = parserLoader(__dirname)

afterEach(resetPage)

describe('accuweather', () => {
  it('reads a forecast\'s current weather and a block for each day ahead', () => {
    const { parseAccuWeather } = load('accuweather.js', ['parseAccuWeather'])
    visit('https://www.accuweather.com/en/us/new-york/10021/weather-forecast/349727', `
      <h1 class="header-loc">New York, NY</h1><span class="header-temp">12°C</span>
      <div class="subnav"><a class="subnav-item" href="/en/us/new-york/10021/hourly-weather-forecast/349727">Hourly</a></div>
      <a class="cur-con-weather-card"><p class="cur-con-weather-card__subtitle">4:46 PM</p><div class="temp">12°<span>C</span></div>
        <div class="real-feel">RealFeel® 11°</div><span class="phrase">Clear</span>
        <div class="detail"><span class="label">Wind</span><span class="value">NW 10 km/h</span></div></a>
      <a class="local-forecast-summary"><p>Dry and warming up</p></a>
      <h2 class="daily-list-header">10-Day Weather Forecast</h2>
      <a class="daily-list-item"><div class="date"><p class="day">Tue</p><p>11/17</p></div><span class="temp-hi">14°</span><span class="temp-lo">6°</span>
        <div class="phrase"><p class="no-wrap">Plenty of sun</p><span class="night"><p>Clear</p></span></div><div class="precip">0%</div></a>`)
    expect(parseAccuWeather()).toEqual({
      title: 'New York, NY weather',
      content: [
        '## Current weather (4:46 PM)',
        '12°C · RealFeel® 11° · Clear',
        'Wind: NW 10 km/h',
        'Dry and warming up',
        '## 10-Day Weather Forecast',
        'Tue 11/17 · 14° / 6° · Plenty of sun · Night: Clear · 0%',
      ],
      links: [{ url: 'https://www.accuweather.com/en/us/new-york/10021/hourly-weather-forecast/349727', score: 0.2 }],
      details: [['place', 'New York, NY'], ['temperature', '12°C']],
    })
  })

  it('leaves a page with no forecast to the default parse', () => {
    const { parseAccuWeather } = load('accuweather.js', ['parseAccuWeather'])
    visit('https://www.accuweather.com/en/weather-news/x', '<h1>News</h1><p>Text</p>')
    expect(parseAccuWeather()).toBeNull()
  })
})
