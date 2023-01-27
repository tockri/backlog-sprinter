import { Immutable } from "immer"
import { atom } from "jotai"
import { atomWithImmer, withImmer } from "jotai-immer"
import { atomWithStorage } from "jotai/utils"
import { BacklogApi, RealBacklogApi } from "../../backlog/BacklogApiForReact"
import { CustomField, CustomFieldTypes, CustomNumberField, isNumberField } from "../../backlog/ProjectInfo"
import { JotaiUtil } from "../../util/JotaiUtil"

import { WritableDraft } from "immer/dist/types/types-external"
import { ProjectFormInfo } from "../types"

export enum Tabs {
  Backlog = 0,
  //  Velocity = 1,
  Stat = 1,
  Settings = 2
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
export const issueTypesAtom = JotaiUtil.atomFromParent(projectInfoAtom, (pi) => pi.issueTypes)
export const statusesAtom = JotaiUtil.atomFromParent(projectInfoAtom, (pi) => pi.statuses)
export const milestonesAtom = JotaiUtil.atomFromParent(projectInfoAtom, (pi) => pi.milestones)
export const customFieldsAtom = withImmer(JotaiUtil.atomFromParent(projectInfoAtom, (pi) => pi.customFields))

enum OrderCustomFieldActionTypes {
  Create = "CreateCustomFieldAction",
  Delete = "DeleteCustomFieldAction"
}
export type OrderCustomFieldActionType = {
  type: OrderCustomFieldActionTypes
}
export const CustomFieldAction = {
  Create: () => ({
    type: OrderCustomFieldActionTypes.Create
  }),
  Delete: () => ({
    type: OrderCustomFieldActionTypes.Delete
  })
}

export const orderCustomFieldAtom = atom<CustomNumberField | null, OrderCustomFieldActionType, Promise<void>>(
  (get) => {
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
  },
  async (get, set, action) => {
    const formInfo = get(formInfoAtom)
    const api = get(backlogApiAtom)
    if (action.type === OrderCustomFieldActionTypes.Create) {
      const issueTypeId = get(appSettingAtom).pbiIssueTypeId
      if (issueTypeId) {
        const created = await api.projectInfo.createCustomField(formInfo.projectKey, {
          typeId: CustomFieldTypes.Number,
          name: `__PBI_ORDER__${issueTypeId}__`,
          applicableIssueTypes: [issueTypeId],
          description: "",
          required: false
        })
        set(customFieldsAtom, (draft) => {
          draft.push(created as WritableDraft<CustomField>)
        })
      }
    } else if (action.type === OrderCustomFieldActionTypes.Delete) {
      const curr = get(orderCustomFieldAtom)
      if (curr) {
        const deleted = await api.projectInfo.deleteCustomField(formInfo.projectKey, curr.id)
        set(customFieldsAtom, (draft) => {
          const idx = draft.findIndex((cf) => cf.id === deleted.id)
          if (idx >= 0) {
            draft.splice(idx, 1)
          }
        })
      }
    }
  }
)
