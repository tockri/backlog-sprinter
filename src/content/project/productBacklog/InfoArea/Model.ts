import { useAtom, useAtomValue } from "jotai"
import { IssueChangeInput, IssueData } from "../../../backlog/Issue"
import { projectAtom } from "../../app/State"
import { PBIChangeAction } from "../PBIList/ListData"
import { selectedIssueAtom } from "../State"

type InfoAreaModel = {
  issue: IssueData | null
  changeIssue: (key: keyof IssueChangeInput, value: string | number) => void
  markdown: boolean
}

export const useInfoAreaModel = (): InfoAreaModel => {
  const [issue, dispatch] = useAtom(selectedIssueAtom)
  const project = useAtomValue(projectAtom)

  return {
    issue,
    changeIssue: issue ? changeIssue(issue.id, dispatch) : () => void 0,
    markdown: project.textFormattingRule === "markdown"
  }
}

const changeIssue =
  (issueId: number, dispatch: (action: PBIChangeAction) => Promise<void>) =>
  async (key: keyof IssueChangeInput, value: string | number) => {
    const input = {
      [key]: value
    }
    await dispatch({ issueId, input })
  }
