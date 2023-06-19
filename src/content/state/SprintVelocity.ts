import { Immutable } from "immer"
import { DateUtil } from "../../util/DateUtil"
import { Issue } from "../backlog/IssueApi"
import { Version } from "../backlog/ProjectInfoApi"

type KeyOrId = string | number

export type SprintVelocity = Immutable<{
  id: number
  endDate: Date
  pbiVelocity: number
  otherVelocity: number
  pbiKeyOrIds: KeyOrId[]
  otherKeyOrIds: KeyOrId[]
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
  const existingKeyIds = new Set(existing.reduce<KeyOrId[]>((acc, sprint) => acc.concat(sprint.pbiKeyOrIds), []))
  let pbiVelocity = 0
  let otherVelocity = 0
  const pbiKeyOrIds: string[] = []
  const otherKeyOrIds: string[] = []
  issues.forEach((issue) => {
    if (!existingKeyIds.has(issue.id) && !existingKeyIds.has(issue.keyId) && !existingKeyIds.has(issue.issueKey)) {
      const point = calcPoint(issue)
      if (issue.issueType.id === pbiIssueTypeId) {
        pbiVelocity += point
        pbiKeyOrIds.push(issue.issueKey)
      } else {
        otherVelocity += point
        otherKeyOrIds.push(issue.issueKey)
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
      pbiKeyOrIds,
      otherKeyOrIds
    }
  ]
}

const D = /^\d+$/
const F = /^\d+(\.\d+)?$/
const IDs = /^[A-Z_\-\d,]+$/

const parse = (line: string): SprintVelocity | null => {
  const elems = line.split("|").map((s) => s.trim())
  if (elems.length === 7 || elems.length === 8) {
    const id = elems[1].match(D) ? parseInt(elems[1]) : null
    const endDate = DateUtil.parseDate(elems[2])
    const pbiVelocity = elems[3].match(F) ? parseFloat(elems[3]) : null
    const otherVelocity = elems[4].match(F) ? parseFloat(elems[4]) : null
    const parseKeyOrIds = (elem: string | undefined): KeyOrId[] =>
      (elem && elem.match(IDs) && elem.split(",").map((e) => (e.match(D) ? parseInt(e) : e))) || []
    const pbiKeyOrIds = parseKeyOrIds(elems[5])
    const otherKeyOrIds = parseKeyOrIds(elems[6])
    return id !== null && endDate !== null && pbiVelocity !== null && otherVelocity !== null && pbiKeyOrIds !== null
      ? { id, endDate, pbiVelocity, otherVelocity, pbiKeyOrIds, otherKeyOrIds }
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
  return `|${s.id}|${DateUtil.dateString(s.endDate)}|${s.pbiVelocity}|${s.otherVelocity}| ${s.pbiKeyOrIds.join(
    ","
  )} | ${s.otherKeyOrIds.join(",")} |`
}

const toStringAll = (sprints: VelocityRecords): string => sprints.map(VelocityFunc.toString).join("\n")

export const VelocityFunc = {
  appendRecord,
  parseAll,
  parse,
  toString,
  toStringAll
} as const
