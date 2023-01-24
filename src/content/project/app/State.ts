import { Immutable } from "immer"
import { atom } from "jotai"
import { atomWithImmer, withImmer } from "jotai-immer"
import { atomWithStorage } from "jotai/utils"
import { BacklogApi, RealBacklogApi } from "../../backlog/BacklogApiForReact"
import { CustomNumberField, isNumberField } from "../../backlog/ProjectInfo"
import { JotaiUtil } from "../../util/JotaiUtil"

import { ProjectFormInfo } from "../types"

export enum Tabs {
  Backlog = 0,
  //  Velocity = 1,
  Settings = 1
}

export type AppSetting = Immutable<{
  selectedTab: Tabs
  pbiIssueTypeId: number
}>

const InitialAppSetting: AppSetting = {
  selectedTab: Tabs.Backlog,
  pbiIssueTypeId: 0
}

export const appSettingAtom = withImmer(atomWithStorage<AppSetting>("bsp.project.app.setting", InitialAppSetting))

export const formInfoAtom = atomWithImmer<ProjectFormInfo>({
  lang: "en",
  projectKey: ""
})

export const backlogApiAtom = atom<BacklogApi>(RealBacklogApi)

const projectInfoAtom = atom(async (get) => {
  const formInfo = get(formInfoAtom)
  const api = get(backlogApiAtom)
  return await api.projectInfo.getProjectInfoWithCustomFields(formInfo.projectKey)
})

export const projectAtom = JotaiUtil.atomFromParent(projectInfoAtom, (pi) => pi.project)
export const issueTypesAtom = withImmer(JotaiUtil.atomFromParent(projectInfoAtom, (pi) => pi.issueTypes))
export const customFieldsAtom = withImmer(JotaiUtil.atomFromParent(projectInfoAtom, (pi) => pi.customFields))
export const statusesAtom = withImmer(JotaiUtil.atomFromParent(projectInfoAtom, (pi) => pi.statuses))

export const orderCustomFieldAtom = atom((get) => {
  const customFields = get(customFieldsAtom)
  const setting = get(appSettingAtom)
  const issueTypes = get(issueTypesAtom)
  const issueType = issueTypes.find((it) => it.id === setting.pbiIssueTypeId)
  if (issueType) {
    return (
      (customFields.find(
        (customField) =>
          customField.applicableIssueTypes.includes(issueType.id) &&
          isNumberField(customField) &&
          customField.name == `__PBI_ORDER__${issueType.id}__`
      ) as CustomNumberField) || null
    )
  } else {
    return null
  }
})

export const productBacklogAtom = JotaiUtil.atomWithAsync(async (get) => {
  const project = get(projectAtom)
  const api = get(backlogApiAtom)
  const setting = get(appSettingAtom)
  const orderCustomField = get(orderCustomFieldAtom)
  const statuses = get(statusesAtom)
  if (orderCustomField !== null) {
    return await api.issue.searchUnclosedInIssueType(project, statuses, setting.pbiIssueTypeId, orderCustomField)
  } else {
    return null
  }
})
