import { Immutable } from "immer"
import { atomWithImmer } from "jotai-immer"
import { IssueTypeColor } from "../../../backlog/ProjectInfoApi"

export type AddIssueTypeFormValue = Immutable<{
  creating: boolean
  name: string
  color: IssueTypeColor
}>

export const AddIssueTypeFormState = {
  atom: atomWithImmer<AddIssueTypeFormValue>({
    creating: false,
    name: "PBI",
    color: IssueTypeColor.pill__issue_type_1
  })
} as const
