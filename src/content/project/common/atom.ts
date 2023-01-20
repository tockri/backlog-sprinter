import * as Recoil from "recoil"
import { ObjectUtil } from "../../../util/ObjectUtil"
import { IssueData } from "../../backlog/Issue"
import { CustomNumberField, isNumberField } from "../../backlog/ProjectInfo"
import { AppSettings, AppState, Tabs } from "./types"

type AppStateAtom = Omit<AppState, "orderCustomField" | "selectedItem">

const defaultSettings: AppSettings = {
  pbiIssueTypeId: null
}

const defaultAtomValue: AppStateAtom = {
  formInfo: null,
  projectInfo: null,
  productBacklogItems: null,
  selectedItemId: null,
  selectedTab: Tabs.Backlog,
  settings: defaultSettings
}

const stateAtom = Recoil.atom<AppStateAtom>({
  key: "project.common.stateAtom",
  default: defaultAtomValue
})

export const stateSelector = Recoil.selector<AppState>({
  key: "project.common.stateSelector",
  get: ({ get }) => {
    const sa = get(stateAtom)
    const selectedItem = getSelectedIssue(sa)
    return {
      ...sa,
      orderCustomField: getOrderCustomField(sa),
      selectedItem,
      selectedItemId: selectedItem ? selectedItem.id : null
    }
  },
  set: ({ set, reset }, newValue) => {
    if (newValue instanceof Recoil.DefaultValue) {
      reset(stateAtom)
    } else {
      set(stateAtom, ObjectUtil.purify(newValue, defaultAtomValue))
    }
  }
})

const getSelectedIssue = (state: AppStateAtom): IssueData | null => {
  const { selectedItemId, productBacklogItems } = state
  if (selectedItemId && productBacklogItems) {
    return productBacklogItems.find((item) => item.id === selectedItemId) || null
  }
  return null
}

const getOrderCustomField = (state: AppStateAtom): CustomNumberField | null => {
  const issueType = state.projectInfo?.issueTypes.find((it) => it.id === state.settings.pbiIssueTypeId)
  if (issueType) {
    return (
      (state.projectInfo?.customFields.find(
        (customField) =>
          customField.applicableIssueTypes.includes(issueType.id) &&
          isNumberField(customField) &&
          customField.name == `__PBI_ORDER__${issueType.id}__`
      ) as CustomNumberField) || null
    )
  } else {
    return null
  }
}
