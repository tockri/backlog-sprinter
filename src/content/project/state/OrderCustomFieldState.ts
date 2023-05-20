import { atom } from "jotai"

import { CustomFieldTypes, CustomNumberField, isNumberField } from "../../backlog/ProjectInfoApi"

import { BspConfState } from "@/content/state/BspConfState"
import { BspEnvState } from "@/content/state/BspEnvState"
import { CustomFieldsState, IssueTypesState } from "../../state/ProjectInfoState"

type Create = {
  type: "OCCreate"
}
type Delete = {
  type: "OCDelete"
}

export type OrderCustomFieldAction = Create | Delete

const mainAtom = atom<Promise<CustomNumberField | null>, [OrderCustomFieldAction], Promise<void>>(
  async (get) => {
    const env = get(BspEnvState.atom)
    if (!env.projectKey) {
      return null
    }
    const conf = get(BspConfState.atom)
    const customFields = await get(CustomFieldsState.atom)
    const issueTypes = await get(IssueTypesState.atom)
    const issueType = issueTypes.find((it) => it.id === conf.pbiIssueTypeId)
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
    if (action.type === "OCCreate") {
      const issueTypeId = get(BspConfState.atom).pbiIssueTypeId
      if (issueTypeId) {
        await set(
          CustomFieldsState.atom,
          CustomFieldsState.Action.Add({
            typeId: CustomFieldTypes.Number,
            name: `__PBI_ORDER__${issueTypeId}__`,
            applicableIssueTypes: [issueTypeId],
            description: "",
            required: false
          })
        )
      }
    } else if (action.type === "OCDelete") {
      const curr = await get(mainAtom)
      if (curr) {
        await set(CustomFieldsState.atom, CustomFieldsState.Action.Delete(curr.id))
      }
    }
  }
)

export const OrderCustomFieldState = {
  atom: mainAtom,
  Action: {
    Create: (): Create => ({
      type: "OCCreate"
    }),
    Delete: (): Delete => ({
      type: "OCDelete"
    })
  }
} as const
