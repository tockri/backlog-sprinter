import { WritableDraft } from "immer/dist/types/types-external"
import { atom } from "jotai"

import { CustomField, CustomFieldTypes, CustomNumberField, isNumberField } from "../../../backlog/ProjectInfo"
import { Api } from "./Api"
import { AppConfig } from "./AppConfig"
import { Environment } from "./Environment"
import { CustomFields, IssueTypes } from "./ProjectInfo"

type Create = {
  type: "OCCreate"
}
type Delete = {
  type: "OCDelete"
}
type Action = Create | Delete

const orderCustomFieldAtom = atom<CustomNumberField | null, Action, Promise<void>>(
  (get) => {
    const customFields = get(CustomFields.atom)
    const setting = get(AppConfig.atom)
    const issueTypes = get(IssueTypes.atom)
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
    const env = get(Environment.atom)
    const api = get(Api.atom)
    if (action.type === "OCCreate") {
      const issueTypeId = get(AppConfig.atom).pbiIssueTypeId
      if (issueTypeId) {
        const created = await api.projectInfo.createCustomField(env.projectKey, {
          typeId: CustomFieldTypes.Number,
          name: `__PBI_ORDER__${issueTypeId}__`,
          applicableIssueTypes: [issueTypeId],
          description: "",
          required: false
        })
        set(CustomFields.atom, (draft) => {
          draft.push(created as WritableDraft<CustomField>)
        })
      }
    } else if (action.type === "OCDelete") {
      const curr = get(orderCustomFieldAtom)
      if (curr) {
        const deleted = await api.projectInfo.deleteCustomField(env.projectKey, curr.id)
        set(CustomFields.atom, (draft) => {
          const idx = draft.findIndex((cf) => cf.id === deleted.id)
          if (idx >= 0) {
            draft.splice(idx, 1)
          }
        })
      }
    }
  }
)

export type OrderCustomFieldAction = Create | Delete

export const OrderCustomField = {
  atom: orderCustomFieldAtom,
  Action: {
    Create: (): Create => ({
      type: "OCCreate"
    }),
    Delete: (): Delete => ({
      type: "OCDelete"
    })
  }
}
