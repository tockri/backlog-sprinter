import { Immutable } from "immer"
import { useAtom, useAtomValue } from "jotai"
import { EditIssueInput, Issue } from "../../../backlog/IssueApi"
import { BspEnvState, UserLang } from "../../../state/BspEnvState"
import { ProjectState } from "../../../state/ProjectInfoState"
import { ItemSelection, ItemSelectionState } from "../state/ItemSelectionState"
import { PBIList, PBIListFunc } from "../state/PBIList"
import { PBIListAction, PBIListState } from "../state/PBIListState"

type InfoAreaModel = Immutable<{
  type: ItemSelection["type"]
}>

export const useInfoAreaModel = (): InfoAreaModel => {
  const item = useAtomValue(ItemSelectionState.atom)
  return {
    type: item.type
  }
}

type IssueAreaModel = Immutable<{
  issue: Issue | null
  changeIssue: (key: keyof EditIssueInput, value: string | number) => void
  markdown: boolean
  lang: UserLang
}>

export const useIssueAreaModel = (): IssueAreaModel => {
  const item = useAtomValue(ItemSelectionState.atom)
  const project = useAtomValue(ProjectState.atom)
  const [pbiList, dispatch] = useAtom(PBIListState.atom)
  const { lang } = useAtomValue(BspEnvState.atom)

  const issue = item.type === "Issue" ? findIssue(pbiList, item.issueId) : null

  return {
    issue,
    changeIssue: issue ? changeIssue(issue.id, dispatch) : () => void 0,
    markdown: project.textFormattingRule === "markdown",
    lang
  }
}

const findIssue = (pbiList: PBIList, issueId: number): Issue | null => {
  return PBIListFunc.findIssue(pbiList, issueId)
}

const changeIssue =
  (issueId: number, dispatch: (action: PBIListAction) => Promise<void> | void) =>
  async (key: keyof EditIssueInput, value: EditIssueInput[typeof key]) => {
    const input = {
      [key]: value
    }
    await dispatch({ type: "EditIssue", issueId, input })
  }
