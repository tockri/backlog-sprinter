import { WritableDraft } from "immer/dist/types/types-external"
import { atom } from "jotai"

import { produce } from "immer"
import { CustomField, CustomFieldTypes, CustomNumberField, isNumberField } from "../../../backlog/ProjectInfo"
import { Api } from "./Api"
import { AppConfState } from "./AppConfState"
import { EnvState } from "./EnvState"
import { CustomFieldsState, IssueTypesState } from "./ProjectInfoState"

type Create = {
  type: "OCCreate"
}
type Delete = {
  type: "OCDelete"
}

export type OrderCustomFieldAction = Create | Delete

const mainAtom = atom<Promise<CustomNumberField | null>, [OrderCustomFieldAction], Promise<void>>(
  async (get) => {
    const customFields = await get(CustomFieldsState.atom)
    const setting = get(AppConfState.atom)
    const issueTypes = await get(IssueTypesState.atom)
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
    const env = get(EnvState.atom)
    const api = get(Api.atom)
    if (action.type === "OCCreate") {
      const issueTypeId = get(AppConfState.atom).pbiIssueTypeId
      if (issueTypeId) {
        const created = await api.projectInfo.createCustomField(env.projectKey, {
          typeId: CustomFieldTypes.Number,
          name: `__PBI_ORDER__${issueTypeId}__`,
          applicableIssueTypes: [issueTypeId],
          description: "",
          required: false
        })
        const customFields = await get(CustomFieldsState.atom)
        set(
          CustomFieldsState.atom,
          produce(customFields, (draft) => {
            draft.push(created as WritableDraft<CustomField>)
          })
        )
      }
    } else if (action.type === "OCDelete") {
      const curr = await get(mainAtom)
      if (curr) {
        const deleted = await api.projectInfo.deleteCustomField(env.projectKey, curr.id)
        const customFields = await get(CustomFieldsState.atom)
        set(
          CustomFieldsState.atom,
          produce(customFields, (draft) => {
            const idx = draft.findIndex((cf) => cf.id === deleted.id)
            if (idx >= 0) {
              draft.splice(idx, 1)
            }
          })
        )
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
}
