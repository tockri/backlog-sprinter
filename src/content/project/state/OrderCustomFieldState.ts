import { atom } from "jotai"
import { ErrorData } from "../../backlog/BacklogApiRequest"
import { CustomFieldTypes, CustomNumberField, isNumberField } from "../../backlog/ProjectInfoApi"
import { BspConfState } from "../../state/BspConfState"
import { BspEnvState } from "../../state/BspEnvState"
import { CustomFieldsState, IssueTypesState } from "../../state/ProjectInfoState"
import { AsyncHandler, JotaiUtil } from "../../util/JotaiUtil"

type CreateErrorMessage = {
  errorInsufficientLicense: string
  errorNoRightForCreateCustomField: string
}

type Create = {
  type: "OCCreate"
  messages: CreateErrorMessage
}

type DeleteErrorMessages = {
  errorNoRightForCreateCustomField: string
}

type Delete = {
  type: "OCDelete"
  messages: DeleteErrorMessages
}

type Action = Create | Delete

const create: AsyncHandler<CustomNumberField | null, Action> = async (curr, get, set, _action) => {
  const action = _action as Create
  const issueTypeId = get(BspConfState.atom).pbiIssueTypeId
  if (issueTypeId) {
    try {
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
      set(errorAtom, "")
    } catch (e) {
      const errorData = e as ErrorData
      const t = action.messages
      const first = errorData.errors[0]
      if (first.code === 2) {
        set(errorAtom, t.errorInsufficientLicense)
      } else if (first.code === 5) {
        set(errorAtom, t.errorNoRightForCreateCustomField)
      } else {
        set(errorAtom, first.message)
      }
    }
  }
  return curr
}

const deleteCustomField: AsyncHandler<CustomNumberField | null, Action> = async (curr, get, set, _action) => {
  const action = _action as Delete
  if (curr) {
    try {
      await set(CustomFieldsState.atom, CustomFieldsState.Action.Delete(curr.id))
      set(errorAtom, "")
    } catch (e) {
      const errorData = e as ErrorData
      const first = errorData.errors[0]
      const t = action.messages
      if (first.code === 5) {
        set(errorAtom, t.errorNoRightForCreateCustomField)
      } else {
        set(errorAtom, first.message)
      }
    }
  }
  return null
}

const mainAtom = JotaiUtil.asyncAtomWithAction<CustomNumberField | null, Action>(
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
  JotaiUtil.composeAsyncHandlers({
    OCCreate: create,
    OCDelete: deleteCustomField
  })
)

const errorAtom = atom("")

export const OrderCustomFieldState = {
  atom: mainAtom,
  errorAtom,
  Action: {
    Create: (messages: CreateErrorMessage): Create => ({
      type: "OCCreate",
      messages
    }),
    Delete: (messages: DeleteErrorMessages): Delete => ({
      type: "OCDelete",
      messages
    })
  }
} as const
