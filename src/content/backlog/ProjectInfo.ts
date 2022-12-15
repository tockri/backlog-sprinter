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
  const projectP = BackgroundClient.apiGet<Project>(`/api/v2/projects/${projectKey}`)
  const versionsP = BackgroundClient.apiGet<Version[]>(`/api/v2/projects/${projectKey}/versions`)
  const statusesP = BackgroundClient.apiGet<Status[]>(`/api/v2/projects/${projectKey}/statuses`)
  const [project, versions, statuses] = await Promise.all([projectP, versionsP, statusesP])
  return {
    project,
    versions,
    statuses
  }
}

export const ProjectInfo = {
  get
}
