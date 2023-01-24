import { Immutable } from "immer"

type SettingModel = Immutable<{
  selectIssueType: (issueTypeId: number) => void
}>

const selectIssueType = ()