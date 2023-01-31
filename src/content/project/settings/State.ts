import { Immutable } from "immer"
import { atomWithImmer } from "jotai-immer"
import { IssueTypeColor } from "../../backlog/ProjectInfo"

export type IssueTypeCreateForm = Immutable<{
  creating: boolean
  name: string
  color: IssueTypeColor
}>

export const issueTypeCreateAtom = atomWithImmer<IssueTypeCreateForm>({
  creating: false,
  name: "PBI",
  color: IssueTypeColor.pill__issue_type_1
})
