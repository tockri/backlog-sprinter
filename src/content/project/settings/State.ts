import { Immutable } from "immer"
import { atomWithImmer } from "jotai-immer"
import { IssueTypeColor } from "../../backlog/ProjectInfo"

export type IssueTypeCreateForm = Immutable<{
  name: string
  color: IssueTypeColor
}>

export const issueTypeCreateAtom = atomWithImmer<IssueTypeCreateForm | null>(null)
