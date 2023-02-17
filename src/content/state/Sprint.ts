import { Issue } from "@/content/backlog/IssueApi"
import { Version } from "@/content/backlog/ProjectInfoApi"
import { DateUtil } from "@/util/DateUtil"
import { Immutable } from "immer"

export type Sprint = Immutable<{
  id: number
  endDate: Date
  pbiVelocity: number
  otherVelocity: number
  issueIds: number[]
}>

const calcPoint = (issue: Issue): number => issue.actualHours || issue.estimatedHours || 1

const build = (
  milestone: Version,
  issues: ReadonlyArray<Issue>,
  pbiIssueTypeId: number,
  existing: ReadonlyArray<Sprint>
): ReadonlyArray<Sprint> => {
  const endDate = DateUtil.parseDate(milestone.releaseDueDate)
  if (!endDate) {
    console.error("releaseDueDate is null", milestone)
    return existing
  }
  const existingIssueIds = new Set(existing.reduce<number[]>((acc, sprint) => acc.concat(sprint.issueIds), []))
  let pbiVelocity = 0
  let otherVelocity = 0
  const issueIds: number[] = []
  issues.forEach((issue) => {
    if (!existingIssueIds.has(issue.id)) {
      issueIds.push(issue.id)
      const point = calcPoint(issue)
      if (issue.issueType.id === pbiIssueTypeId) {
        pbiVelocity += point
      } else {
        otherVelocity += point
      }
    }
  })
  return [
    ...existing,
    {
      id: milestone.id,
      endDate: DateUtil.parseDate(milestone.releaseDueDate) || new Date(),
      pbiVelocity,
      otherVelocity,
      issueIds
    }
  ]
}

const parse = (line: string): Sprint | null => {
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
}

const parseAll = (data: string): ReadonlyArray<Sprint> => {
  const ret: Array<Sprint> = []
  data.split("\n").forEach((line) => {
    const s = SprintUtil.parse(line)
    if (s) {
      ret.push(s)
    }
  })
  return ret
}

const toString = (s: Sprint): string => {
  return `|${s.id}|${DateUtil.dateString(s.endDate)}|${s.pbiVelocity}|${s.otherVelocity}|${s.issueIds.join(",")}|`
}

const toStringAll = (sprints: ReadonlyArray<Sprint>): string => sprints.map(SprintUtil.toString).join("\n")

export const SprintUtil = {
  build,

  parseAll,

  parse,

  toString,

  toStringAll
}
