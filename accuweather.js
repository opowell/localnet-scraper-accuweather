// An element's text, its whitespace collapsed.
function accuText(element) {
  return element?.textContent.replace(/\s+/g, ' ').trim() || ''
}

// A day of a forecast as one block: "Today 11/16 · 12° / 4° · Sunny · Night: Clear · 10%".
function accuDay(parts) {
  return parts.map(part => String(part || '').replace(/^\//, '').trim()).filter(Boolean).join(' · ')
}

// A place's forecast (/en/us/new-york/10021/weather-forecast/349727) reads as the place, its current weather (its
// temperature, RealFeel and conditions, then its wind, gusts and air quality, "Wind: NW 10 km/h"), the summary of the
// days ahead and its 10-day forecast, a block a day ("Today 11/16 · 12° / 4° · Sunny · Night: Clear · 0%"). Its 10-day
// page (/daily-weather-forecast/…) reads as a block a day, with what each day's panel adds ("RealFeel® 13°", "Wind NW 9
// km/h"). Its details are the place and its current temperature. It links with weight 0.2 to the place's other
// forecasts (hourly, daily, current, radar). Any other page is left to the default parse.
function parseAccuWeather(_profileId) {
  if (!/(?:^|\.)accuweather\.com$/.test(location.hostname)) {
    return null
  }
  const place = accuText(document.querySelector('h1.header-loc, .header-loc'))
  const current = document.querySelector('.cur-con-weather-card')
  const days = Array.from(document.querySelectorAll('.daily-list-item'))
  const cards = Array.from(document.querySelectorAll('.daily-wrapper'))
  if (!place || (!current && !days.length && !cards.length)) {
    return null
  }
  const content = []
  if (current) {
    const time = accuText(current.querySelector('.cur-con-weather-card__subtitle'))
    content.push(`## Current weather${time ? ` (${time})` : ''}`)
    content.push(accuDay([
      accuText(current.querySelector('.temp')),
      accuText(current.querySelector('.real-feel')),
      accuText(current.querySelector('.phrase')),
    ]))
    for (const detail of current.querySelectorAll('.detail')) {
      const label = accuText(detail.querySelector('.label'))
      const value = accuText(detail.querySelector('.value'))
      if (label && value) {
        content.push(`${label}: ${value}`)
      }
    }
  }
  const ahead = document.querySelector('.local-forecast-summary p')
  if (ahead) {
    content.push(accuText(ahead))
  }
  if (days.length) {
    content.push(`## ${accuText(document.querySelector('.daily-list-header')) || '10-Day Weather Forecast'}`)
    for (const day of days) {
      content.push(accuDay([
        Array.from(day.querySelectorAll('.date p'), accuText).join(' '),
        [accuText(day.querySelector('.temp-hi')), accuText(day.querySelector('.temp-lo'))].filter(Boolean).join(' / '),
        accuText(day.querySelector('.phrase > p')),
        accuText(day.querySelector('.night')).replace(/^(?!Night:)(?=\S)/, 'Night: '),
        accuText(day.querySelector('.precip')),
      ]))
    }
  }
  for (const card of cards) {
    const panels = Array.from(card.querySelectorAll('.panel-item'), (item) => {
      const value = accuText(item.querySelector('.value'))
      return `${accuText(item).slice(0, -value.length || undefined).trim()} ${value}`.trim()
    })
    content.push(accuDay([
      Array.from(card.querySelectorAll('.date .date'), accuText).join(' '),
      [accuText(card.querySelector('.high')), accuText(card.querySelector('.low')).replace(/^\//, '')].filter(Boolean).join(' / '),
      accuText(card.querySelector('.phrase')),
      accuText(card.querySelector('.precip')),
      ...panels,
    ]))
  }
  const here = location.href.split(/[?#]/)[0]
  const forecasts = [...new Set(linkUrls('a.subnav-item, .subnav-item a, .subnav a[href]').map(url => url.split(/[?#]/)[0]))]
    .filter(url => url !== here && /\/\d+$/.test(url))
  return {
    title: `${place} weather`,
    content: content.filter(Boolean),
    links: forecasts.map(url => ({ url, score: 0.2 })),
    details: [
      ['place', place],
      ['temperature', accuText(document.querySelector('.header-temp')) || null],
    ],
  }
}

// The parser a scrape calls.
registerParser(parseAccuWeather)
