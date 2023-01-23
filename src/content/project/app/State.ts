import { Immutable } from "immer"
import { atom } from "jotai"
import { atomWithImmer } from "jotai-immer"
import { atomWithStorage } from "jotai/utils"
import { IssueData } from "../../backlog/Issue"
import { CustomField, IssueType, Project, RealProjectInfo, Status } from "../../backlog/ProjectInfo"
import { Tabs } from "../common/types"
import { PBFormInfo } from "../types"

type AppSetting = Immutable<{
  selectedTab: Tabs
  pbiIssueTypeId: number | null
}>

const InitialAppData: AppSetting = {
  selectedTab: Tabs.Backlog,
  pbiIssueTypeId: null
}

export const appSettingAtom = atomWithStorage<AppSetting>("project.app.setting", InitialAppData)

export const formInfoAtom = atomWithImmer<PBFormInfo>({
  lang: "en",
  projectKey: ""
})

export const projectAtom = atomWithImmer<Project | null>(null)

export const issueTypesAtom = atomWithImmer<Immutable<IssueType[]>>([])

export const statusesAtom = atomWithImmer<Immutable<Status[]>>([])

export const customFieldsAtom = atomWithImmer<Immutable<CustomField[]>>([])

const projectInfoLoader = atom(null, async (get, set) => {
  const formInfo = get(formInfoAtom)
  const projectInfo = await RealProjectInfo.getProjectInfoWithCustomFields(formInfo.projectKey)
  set(projectAtom, projectInfo.project)
  set(issueTypesAtom, projectInfo.issueTypes)
  set(statusesAtom, projectInfo.statuses)
  set(customFieldsAtom, projectInfo.customFields)
})

export const productBacklogAtom = atomWithImmer<Immutable<IssueData[]>>([])
