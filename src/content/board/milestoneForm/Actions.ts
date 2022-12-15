import { Issue, IssueCallback } from "../../backlog/Issue"
import { Milestone, MilestoneInput } from "../../backlog/Milestone"
import { ProjectInfoData } from "../../backlog/ProjectInfo"
import { ViewState } from "./Reducers"

type SubmitResult = {
  createdMilestoneId: number | null
  errorMessage: string | null
}

const submitForm = async (
  state: ViewState,
  projectInfo: ProjectInfoData,
  callback?: IssueCallback
): Promise<SubmitResult> => {
  const milestoneInput: MilestoneInput = {
    projectId: projectInfo.project.id,
    name: state.title,
    startDate: state.startDate,
    endDate: state.endDate,
    description: ""
  }
  try {
    const createdMilestoneId = await Milestone.create(milestoneInput)
    if (state.selectedMilestone) {
      if (state.moveUnclosed) {
        const unclosed = await Issue.searchUnclosed(projectInfo, state.selectedMilestone.id)
        await Issue.bulkChangeMilestone(unclosed, createdMilestoneId, callback)
      }
      if (state.archiveCurrent) {
        await Milestone.archive(projectInfo.project.id, state.selectedMilestone)
      }
    }
    return {
      createdMilestoneId,
      errorMessage: null
    }
  } catch (e) {
    const err = e as Error
    return {
      createdMilestoneId: null,
      errorMessage: err?.message || "unknown error"
    }
  }
}

export const Actions = {
  submitForm
} as const
