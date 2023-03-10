import { Issue } from "@/content/backlog/IssueApi"
import { Version } from "@/content/backlog/ProjectInfoApi"
import { DateUtil } from "@/util/DateUtil"
import { Immutable } from "immer"

export type SprintVelocity = Immutable<{
  id: number
  endDate: Date
  pbiVelocity: number
  otherVelocity: number
  keyIds: number[]
}>

export type VelocityRecords = ReadonlyArray<SprintVelocity>

const calcPoint = (issue: Issue): number => issue.estimatedHours || 1

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
  const existingKeyIds = new Set(existing.reduce<number[]>((acc, sprint) => acc.concat(sprint.keyIds), []))
  let pbiVelocity = 0
  let otherVelocity = 0
  const keyIds: number[] = []
  issues.forEach((issue) => {
    if (!existingKeyIds.has(issue.id) && !existingKeyIds.has(issue.keyId)) {
      keyIds.push(issue.keyId)
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
      keyIds: keyIds
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
      ? { id, endDate, pbiVelocity, otherVelocity, keyIds: issueIds }
      : null
  }
  return null
}

const parseAll = (data: string): VelocityRecords => {
  const ret: Array<SprintVelocity> = []
  data.split("\n").forEach((line) => {
    const s = VelocityFunc.parse(line)
    if (s) {
      ret.push(s)
    }
  })
  return ret
}

const toString = (s: SprintVelocity): string => {
  return `|${s.id}|${DateUtil.dateString(s.endDate)}|${s.pbiVelocity}|${s.otherVelocity}| ${s.keyIds.join(",")} |`
}

const toStringAll = (sprints: VelocityRecords): string => sprints.map(VelocityFunc.toString).join("\n")

export const VelocityFunc = {
  appendRecord,
  parseAll,
  parse,
  toString,
  toStringAll
} as const
