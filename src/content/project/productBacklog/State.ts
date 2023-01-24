import { atom } from "jotai"
import { withImmer } from "jotai-immer"
import { IssueData } from "../../backlog/Issue"
import { CustomNumberField } from "../../backlog/ProjectInfo"
import { JotaiUtil } from "../../util/JotaiUtil"
import { appSettingAtom, backlogApiAtom, milestonesAtom, orderCustomFieldAtom, projectAtom } from "../app/State"
import { PBIListDataHandler } from "./PBIList/PBIListData"

export const productBacklogAtom = withImmer(
  JotaiUtil.atomWithAsync(async (get) => {
    const project = get(projectAtom)
    const api = get(backlogApiAtom)
    const setting = get(appSettingAtom)
    const today = new Date().getTime()
    const milestones = get(milestonesAtom).filter(
      (ms) => !ms.archived && ms.releaseDueDate && Date.parse(ms.releaseDueDate) > today
    )
    const orderCustomField = get(orderCustomFieldAtom)
    if (orderCustomField) {
      const list = await api.issue.searchInIssueTypeAndMilestones(project, setting.pbiIssueTypeId, milestones)
      return PBIListDataHandler.nest(
        list.map((issue) => ({
          ...issue,
          order: orderCustomField && getOrderValue(orderCustomField, issue)
        }))
      )
    } else {
      throw new Error("orderCustomField is not set.")
    }
  })
)

const getOrderValue = (orderCusomField: CustomNumberField, issue: IssueData): number | null => {
  const field = issue.customFields.find((cf) => cf.id === orderCusomField.id)
  if (field) {
    return field.value !== null ? Number(field.value) : null
  } else {
    return null
  }
}

export const selectedIssueIdAtom = atom<number | null>(null)
