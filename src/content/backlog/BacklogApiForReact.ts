import React from "react"
import { IssueApi, RealIssue } from "./Issue"
import { ProjectInfoApi, RealProjectInfo } from "./ProjectInfo"

export type BacklogApi = {
  issue: IssueApi
  projectInfo: ProjectInfoApi
}

const rejectFunc = () => {
  console.warn("not implemented")
  return Promise.reject()
}

const fakeIssueApi: IssueApi = {
  searchUnclosedInMilestone: rejectFunc,
  searchInIssueTypeAndMilestones: rejectFunc,
  bulkChangeMilestone: rejectFunc,
  changeMilestoneAndCustomFieldValue: rejectFunc,
  changeInfo: rejectFunc
}

const fakeProjectInfoApi: ProjectInfoApi = {
  getProjectInfoWithMilestones: rejectFunc,
  getProjectInfoWithCustomFields: rejectFunc,
  createCustomField: rejectFunc,
  deleteCustomField: rejectFunc,
  createMilestone: rejectFunc,
  archiveMilestone: rejectFunc
}

export const FakeBacklogApi: BacklogApi = {
  issue: fakeIssueApi,
  projectInfo: fakeProjectInfoApi
}

export const RealBacklogApi: BacklogApi = {
  issue: RealIssue,
  projectInfo: RealProjectInfo
}

export const BacklogApiContext = React.createContext<BacklogApi>(FakeBacklogApi)
