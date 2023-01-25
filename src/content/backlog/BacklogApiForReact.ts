import React from "react"
import { IssueApi, RealIssue } from "./Issue"
import { ProjectInfoApi, RealProjectInfo } from "./ProjectInfo"

export type BacklogApi = {
  issue: IssueApi
  projectInfo: ProjectInfoApi
}

const rejector = () => Promise.reject()

const fakeIssueApi: IssueApi = {
  searchUnclosedInMilestone: rejector,
  searchInIssueTypeAndMilestones: rejector,
  bulkChangeMilestone: rejector,
  changeMilestoneAndCustomFieldValue: rejector,
  changeInfo: rejector
}

const fakeProjectInfoApi: ProjectInfoApi = {
  getProjectInfoWithMilestones: rejector,
  getProjectInfoWithCustomFields: rejector,
  createCustomField: rejector,
  deleteCustomField: rejector,
  createMilestone: rejector,
  archiveMilestone: rejector
}

export const BacklogApiContext = React.createContext<BacklogApi>({
  issue: fakeIssueApi,
  projectInfo: fakeProjectInfoApi
})

export const RealBacklogApi: BacklogApi = {
  issue: RealIssue,
  projectInfo: RealProjectInfo
}
