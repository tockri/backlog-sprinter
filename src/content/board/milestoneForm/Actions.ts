import { Issue, IssueCallback } from "../../backlog/Issue"
import { MilestoneInput, MilestonesData, ProjectInfo } from "../../backlog/ProjectInfo"
import { ViewState } from "./Reducers"

type SubmitResult = {
  createdMilestoneId: number | null
  errorMessage: string | null
}

const submitForm = async (
  state: ViewState,
  projectInfo: MilestonesData,
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
    const createdMilestoneId = await ProjectInfo.createMilestone(milestoneInput)
    if (state.selectedMilestone) {
      if (state.moveUnclosed) {
        const unclosed = await Issue.searchUnclosedInMilestone(
          projectInfo.project,
          projectInfo.statuses,
          state.selectedMilestone.id
        )
        await Issue.bulkChangeMilestone(unclosed, createdMilestoneId, callback)
      }
      if (state.archiveCurrent) {
        await ProjectInfo.archiveMilestone(projectInfo.project.id, state.selectedMilestone)
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
