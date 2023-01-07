import { BackgroundClient } from "../BackgroundClient"

export type Project = {
  readonly id: number
  readonly name: string
}

export type Version = {
  readonly id: number
  readonly name: string
  readonly description: string | null
  readonly startDate: string | null
  readonly releaseDueDate: string | null
  readonly archived: boolean
  readonly displayOrder: number
}

export type Status = {
  readonly id: number
  readonly name: string
}

export type ProjectInfoData = {
  readonly project: Project
  readonly versions: ReadonlyArray<Version>
  readonly statuses: ReadonlyArray<Status>
}

const get = async (projectKey: string): Promise<ProjectInfoData> => {
  const project = await BackgroundClient.blgApiGet<Project>(`/api/v2/projects/${projectKey}`)
  const versionsP = BackgroundClient.blgApiGet<Version[]>(`/api/v2/projects/${projectKey}/versions`)
  const statusesP = BackgroundClient.blgApiGet<Status[]>(`/api/v2/projects/${projectKey}/statuses`)
  const [versions, statuses] = await Promise.all([versionsP, statusesP])
  return {
    project,
    versions,
    statuses
  }
}

export const ProjectInfo = {
  get
}
