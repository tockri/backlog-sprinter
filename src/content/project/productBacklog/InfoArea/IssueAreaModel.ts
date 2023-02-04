import { Immutable } from "immer"
import { useAtom, useAtomValue } from "jotai"
import { EditIssueInput, IssueData } from "../../../backlog/Issue"
import { Environment } from "../../app/state/Environment"
import { ProjectAtom } from "../../app/state/ProjectInfo"
import { UserLang } from "../../types"
import { PBIListData, PBIListDataHandler } from "../PBIList/ListData"
import { ProductBacklog, ProductBacklogAction } from "../state/ProductBacklog"
import { SelectedItem, SelectedItemAction } from "../state/SelectedItem"

type InfoAreaModel = Immutable<{
  type: SelectedItemAction["type"]
}>

export const useInfoAreaModel = (): InfoAreaModel => {
  const item = useAtomValue(SelectedItem.atom)
  return {
    type: item.type
  }
}

type IssueAreaModel = Immutable<{
  issue: IssueData | null
  changeIssue: (key: keyof EditIssueInput, value: string | number) => void
  markdown: boolean
  lang: UserLang
}>

export const useIssueAreaModel = (): IssueAreaModel => {
  const item = useAtomValue(SelectedItem.atom)
  const project = useAtomValue(ProjectAtom.atom)
  const [pbiList, dispatch] = useAtom(ProductBacklog.atom)
  const { lang } = useAtomValue(Environment.atom)

  const issue = item.type === "Issue" ? findIssue(pbiList, item.issueId) : null

  return {
    issue,
    changeIssue: issue ? changeIssue(issue.id, dispatch) : () => void 0,
    markdown: project.textFormattingRule === "markdown",
    lang
  }
}

const findIssue = (pbiList: PBIListData, issueId: number): IssueData | null => {
  const [issue] = PBIListDataHandler.findIssue(pbiList, issueId)
  return issue
}

const changeIssue =
  (issueId: number, dispatch: (action: ProductBacklogAction) => Promise<void> | void) =>
  async (key: keyof EditIssueInput, value: EditIssueInput[typeof key]) => {
    const input = {
      [key]: value
    }
    await dispatch({ type: "EditIssue", issueId, input })
  }
