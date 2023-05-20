const lpad = (n: number): string => (n < 10 ? `0${n}` : `${n}`)

const dateString = (d: Date | null, delimiter?: string): string => {
  if (d) {
    const delim = delimiter || "-"
    const year = d.getFullYear()
    const mon = d.getMonth() + 1
    const date = d.getDate()
    return `${year}${delim}${lpad(mon)}${delim}${lpad(date)}`
  } else {
    return ""
  }
}

const parseDate = (str: string | null): Date | null => {
  if (str) {
    if (str.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(`${str} 00:00:00`)
    } else {
      return beginningOfDay(new Date(str))
    }
  }
  return null
}

const shortDateString = (d: Date): string => {
  const mon = d.getMonth() + 1
  const date = d.getDate()
  return `${lpad(mon)}-${lpad(date)}`
}

const addDays = (d: Date, days: number): Date => {
  const ret = new Date(d.getTime())
  ret.setDate(ret.getDate() + days)
  return ret
}

const diffDays = (former: Date, latter: Date): number => {
  return Math.round((beginningOfDay(latter).getTime() - beginningOfDay(former).getTime()) / 24 / 3600 / 1000)
}

const beginningOfDay = (dateTime: Date): Date => {
  const date = new Date(dateTime)
  date.setHours(0)
  date.setMinutes(0)
  date.setSeconds(0)
  return date
}

export const DateUtil = {
  parseDate,
  dateString,
  shortDateString,
  addDays,
  diffDays,
  beginningOfDay
} as const
