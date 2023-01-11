import * as Recoil from "recoil"
import { CustomNumberField, isNumberField } from "../../backlog/ProjectInfo"
import { AppState, defaultAppState } from "./types"

type AppStateAtom = Omit<AppState, "orderCustomField">

const stateAtom = Recoil.atom<AppStateAtom>({
  key: "project.common.stateAtom",
  default: defaultAppState()
})

export const stateSelector = Recoil.selector<AppState>({
  key: "project.common.stateSelector",
  get: ({ get }) => {
    const sa = get(stateAtom)
    return {
      ...sa,
      orderCustomField: getOrderCustomField(sa)
    }
  },
  set: ({ set, reset }, newValue) => {
    if (newValue instanceof Recoil.DefaultValue) {
      reset(stateAtom)
    } else {
      set(stateAtom, newValue)
    }
  }
})

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
