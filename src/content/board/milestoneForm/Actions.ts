import { BacklogApi } from "../../backlog/BacklogApiForReact"
import { IssueData } from "../../backlog/Issue"
import { AddMilestoneInput, ProjectInfoWithMilestones } from "../../backlog/ProjectInfo"
import { ViewState } from "./Reducers"

type SubmitResult = {
  createdMilestoneId: number | null
  errorMessage: string | null
}

const submitForm = async (
  api: BacklogApi,
  state: ViewState,
  projectInfo: ProjectInfoWithMilestones,
  callback?: (issue: IssueData) => void
): Promise<SubmitResult> => {
  const milestoneInput: AddMilestoneInput = {
    projectId: projectInfo.project.id,
    name: state.title,
    startDate: state.startDate,
    endDate: state.endDate,
    description: ""
  }
  try {
    const createdMilestone = await api.projectInfo.addMilestone(milestoneInput)
    if (state.selectedMilestone) {
      if (state.moveUnclosed) {
        const unclosed = await api.issue.searchUnclosedInMilestone(
          projectInfo.project,
          projectInfo.statuses,
          state.selectedMilestone.id
        )
        await api.issue.bulkChangeMilestone(
          unclosed.map((i) => i.id),
          createdMilestone.id,
          (id) => {
            const issue = unclosed.find((issue) => issue.id === id)
            if (callback && issue) {
              callback(issue)
            }
          }
        )
      }
      if (state.archiveCurrent) {
        await api.projectInfo.archiveMilestone(projectInfo.project.id, state.selectedMilestone)
      }
    }
    return {
      createdMilestoneId: createdMilestone.id,
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
