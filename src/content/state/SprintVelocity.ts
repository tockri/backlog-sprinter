import { Issue } from "@/content/backlog/IssueApi"
import { Version } from "@/content/backlog/ProjectInfoApi"
import { DateUtil } from "@/util/DateUtil"
import { Immutable } from "immer"

export type SprintVelocity = Immutable<{
  id: number
  endDate: Date
  pbiVelocity: number
  otherVelocity: number
  issueIds: number[]
}>

export type VelocityRecords = ReadonlyArray<SprintVelocity>

const calcPoint = (issue: Issue): number => issue.actualHours || issue.estimatedHours || 1

const appendRecord = (
  milestone: Version,
  issues: ReadonlyArray<Issue>,
  pbiIssueTypeId: number,
  existing: VelocityRecords
): VelocityRecords => {
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

const D = /^\d+$/
const F = /^\d+(\.\d+)?$/
const IDs = /^[\d,]+$/

const parse = (line: string): SprintVelocity | null => {
  const elems = line.split("|").map((s) => s.trim())
  if (elems.length === 7) {
    const id = elems[1].match(D) ? parseInt(elems[1]) : null
    const endDate = DateUtil.parseDate(elems[2])
    const pbiVelocity = elems[3].match(F) ? parseFloat(elems[3]) : null
    const otherVelocity = elems[4].match(F) ? parseFloat(elems[4]) : null
    const issueIds = elems[5].match(IDs) ? elems[5].split(",").map((e) => parseInt(e)) : []
    return id !== null && endDate !== null && pbiVelocity !== null && otherVelocity !== null && issueIds !== null
      ? { id, endDate, pbiVelocity, otherVelocity, issueIds }
      : null
  }
  return null
}

const parseAll = (data: string): VelocityRecords => {
  const ret: Array<SprintVelocity> = []
  data.split("\n").forEach((line) => {
    const s = VelocityUtil.parse(line)
    if (s) {
      ret.push(s)
    }
  })
  return ret
}

const toString = (s: SprintVelocity): string => {
  return `|${s.id}|${DateUtil.dateString(s.endDate)}|${s.pbiVelocity}|${s.otherVelocity}| ${s.issueIds.join(",")} |`
}

const toStringAll = (sprints: VelocityRecords): string => sprints.map(VelocityUtil.toString).join("\n")

export const VelocityUtil = {
  appendRecord,
  parseAll,
  parse,
  toString,
  toStringAll
} as const
