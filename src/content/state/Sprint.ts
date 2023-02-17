import { DateUtil } from "@/util/DateUtil"
import { Immutable } from "immer"

export type Sprint = Immutable<{
  id: number
  endDate: Date
  pbiVelocity: number
  otherVelocity: number
  issueIds: number[]
}>

export const SprintUtil = {
  parseAll: (data: string): ReadonlyArray<Sprint> => {
    const ret: Array<Sprint> = []
    data.split("\n").forEach((line) => {
      const s = SprintUtil.parse(line)
      if (s) {
        ret.push(s)
      }
    })
    return ret
  },

  parse: (line: string): Sprint | null => {
    const m = line.match(/^[|](\d+)[|](\d{4}-\d{2}-\d{2})[|]([\d.]+)[|]([\d.]+)[|]([\d,]*)[|]$/)
    if (m) {
      try {
        const id = parseInt(m[1])
        const endDate = DateUtil.parseDate(m[2])
        const pbiVelocity = parseFloat(m[3])
        const otherVelocity = parseFloat(m[4])
        const issueIds = m[5].split(",").map((e) => parseInt(e))
        return endDate ? { id, endDate, pbiVelocity, otherVelocity, issueIds } : null
      } catch (e) {
        return null
      }
    }
    return null
  },

  toString: (s: Sprint): string => {
    return `|${s.id}|${DateUtil.dateString(s.endDate)}|${s.pbiVelocity}|${s.otherVelocity}|${s.issueIds.join(",")}|`
  },

  toStringAll: (sprints: ReadonlyArray<Sprint>): string => sprints.map(SprintUtil.toString).join("\n")
}
