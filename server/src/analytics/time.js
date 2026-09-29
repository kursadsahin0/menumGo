const timeZone = 'Europe/Istanbul'

export function zonedParts(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const read = (type) => parts.find((part) => part.type === type)?.value
  const hour = Number(read('hour'))

  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: hour === 24 ? 0 : hour,
    key: `${read('year')}-${read('month')}-${read('day')}`,
  }
}

export function addDays(key, offset) {
  const [year, month, day] = key.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + offset))

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-')
}

export function startOfDay(key) {
  return new Date(`${key}T00:00:00+03:00`)
}

export function dayKeys(days, now = new Date()) {
  const end = zonedParts(now).key
  const keys = []

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    keys.push(addDays(end, -offset))
  }

  return keys
}

export function dayLabel(key, days) {
  const date = new Date(`${key}T12:00:00+03:00`)
  const weekday = new Intl.DateTimeFormat('tr-TR', {
    timeZone,
    weekday: 'short',
  }).format(date)
  const calendar = new Intl.DateTimeFormat('tr-TR', {
    timeZone,
    day: 'numeric',
    month: 'short',
  })
    .format(date)
    .replace('.', '')

  if (days > 7) {
    return calendar
  }

  return `${calendar.split(' ')[0]} ${weekday}`
}

export function weekdayLabel(key) {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone,
    weekday: 'long',
  }).format(new Date(`${key}T12:00:00+03:00`))
}

export function relativeTime(date, now = new Date()) {
  const elapsed = now.getTime() - date.getTime()
  const minutes = Math.floor(elapsed / 60000)

  if (minutes < 1) {
    return 'Az önce'
  }

  if (minutes < 60) {
    return `${minutes} dk önce`
  }

  const key = zonedParts(date).key
  const today = zonedParts(now).key

  if (key === today) {
    return `${Math.floor(minutes / 60)} sa önce`
  }

  if (key === addDays(today, -1)) {
    return 'Dün'
  }

  const [year, month, day] = today.split('-').map(Number)
  const [eventYear, eventMonth, eventDay] = key.split('-').map(Number)
  const days = Math.round(
    (Date.UTC(year, month - 1, day) - Date.UTC(eventYear, eventMonth - 1, eventDay)) / 86400000,
  )

  if (days > 1 && days < 7) {
    return `${days} gün önce`
  }

  return new Intl.DateTimeFormat('tr-TR', {
    timeZone,
    day: 'numeric',
    month: 'short',
  }).format(date)
}
