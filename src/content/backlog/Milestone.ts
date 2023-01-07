import { BackgroundClient } from "../BackgroundClient"
import { DateUtil } from "../util/DateUtil"
import { Version } from "./ProjectInfo"

export type MilestoneInput = {
  readonly projectId: number
  readonly name: string
  readonly startDate: Date | null
  readonly endDate: Date | null
  readonly description: string
}

const create = async (input: MilestoneInput): Promise<number> => {
  const created = await BackgroundClient.blgApiPost<Version>(`/api/v2/projects/${input.projectId}/versions`, {
    name: input.name,
    startDate: DateUtil.dateString(input.startDate),
    releaseDueDate: DateUtil.dateString(input.endDate),
    description: input.description
  })
  return created.id
}

const archive = async (projectId: number, milestone: Version) => {
  await BackgroundClient.blgApiPatch<Version>(`/api/v2/projects/${projectId}/versions/${milestone.id}`, {
    name: milestone.name,
    archived: "true"
  })
}

export const Milestone = {
  create,
  archive
}
