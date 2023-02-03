import { Immutable } from "immer"
import { useAtom, useAtomValue } from "jotai"
import { IssueChangeInput, IssueData } from "../../../backlog/Issue"
import { Version } from "../../../backlog/ProjectInfo"
import { milestonesAtom, projectAtom } from "../../app/State"
import { PBIListData, PBIListDataHandler } from "../PBIList/ListData"
import { ProductBacklogAction, productBacklogAtom } from "../State"
import { SelectedItem } from "../state/SelectedItem"

type InfoAreaModel = Immutable<{
  type?: SelectedItem["type"]
}>

export const useInfoAreaModel = (): InfoAreaModel => {
  const item = useAtomValue(SelectedItem.atom)
  return {
    type: item?.type
  }
}

type IssueAreaModel = Immutable<{
  issue: IssueData | null
  changeIssue: (key: keyof IssueChangeInput, value: string | number) => void
  markdown: boolean
}>

export const useIssueAreaModel = (): IssueAreaModel => {
  const item = useAtomValue(SelectedItem.atom)
  const project = useAtomValue(projectAtom)
  const [pbiList, dispatch] = useAtom(productBacklogAtom)

  const issue = item?.type === "Issue" ? findIssue(pbiList, item.issueId) : null

  return {
    issue,
    changeIssue: issue ? changeIssue(issue.id, dispatch) : () => void 0,
    markdown: project.textFormattingRule === "markdown"
  }
}

const findIssue = (pbiList: PBIListData, issueId: number): IssueData | null => {
  const [issue] = PBIListDataHandler.findIssue(pbiList, issueId)
  return issue
}

const changeIssue =
  (issueId: number, dispatch: (action: ProductBacklogAction) => Promise<void> | void) =>
  async (key: keyof IssueChangeInput, value: IssueChangeInput[typeof key]) => {
    const input = {
      [key]: value
    }
    await dispatch({ type: "EditIssue", issueId, input })
  }

type MilestoneAreaModel = Immutable<{
  milestone: Version | null
}>

export const useMilestoneAreaModel = (): MilestoneAreaModel => {
  const item = useAtomValue(SelectedItem.atom)
  const milestones = useAtomValue(milestonesAtom)
  const milestone = item?.type === "Milestone" ? findMilestone(milestones, item.milestoneId) : null
  return {
    milestone
  }
}

const findMilestone = (milestones: ReadonlyArray<Version>, milestoneId: number): Version | null =>
  milestones.find((ms) => ms.id === milestoneId) || null
