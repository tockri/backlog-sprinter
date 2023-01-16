import { DateUtil } from "../../../util/DateUtil"
import { ProjectInfoWithMilestones, Version } from "../../backlog/ProjectInfo"

export type PartialViewState = {
  sprintDays: number
  moveUnclosed: boolean
  archiveCurrent: boolean
}

export type ViewState = PartialViewState & {
  selectedMilestone: Version | null
  startDate: Date | null
  endDate: Date | null
  title: string
  titleAuto: boolean
  sameTitleExists: boolean
  submittable: boolean
  submitting: boolean
  submitErrorMessage: string | null
  submittingMessage: string | null
}

type Src = keyof ViewState

type StateAction = {
  src: Src
  value: ViewState[Src]
}

type SubmittingAction = {
  src: "submit"
  submitting: boolean
  submitErrorMessage: string | null
  submittingMessage: string | null
}

export type ViewStateAction = StateAction | SubmittingAction

const isStateAction = (action: ViewStateAction): action is StateAction => action.src !== "submit"

export type ReducerFunc = (state: ViewState, action: ViewStateAction) => ViewState

const baseReducer: ReducerFunc = (state, action) => {
  return isStateAction(action)
    ? {
        ...state,
        [action.src]: action.value
      }
    : {
        ...state,
        submitting: action.submitting,
        submitErrorMessage: action.submitErrorMessage,
        submittingMessage: action.submittingMessage
      }
}

const reduceStartDate: ReducerFunc = (state, action) => {
  if (action.src === "startDate") {
    const { startDate, sprintDays } = state
    if (startDate && sprintDays >= 0) {
      return {
        ...state,
        endDate: DateUtil.addDays(startDate, sprintDays)
      }
    }
  }
  return state
}

const reduceEndDate: ReducerFunc = (state, action) => {
  if (action.src === "endDate") {
    const { startDate, endDate } = state
    if (startDate && endDate) {
      if (startDate < endDate) {
        return {
          ...state,
          sprintDays: DateUtil.diffDays(startDate, endDate)
        }
      } else {
        return {
          ...state,
          sprintDays: 0,
          endDate: startDate
        }
      }
    } else {
      return {
        ...state,
        sprintDays: -1
      }
    }
  } else {
    return state
  }
}

const makeAutoTitle = (startDate: Date, endDate: Date): string =>
  `${DateUtil.shortDateString(startDate)} ~ ${DateUtil.shortDateString(endDate)} sprint`

const reduceTitle: ReducerFunc = (state, action) => {
  if (action.src === "title") {
    return {
      ...state,
      titleAuto: false
    }
  } else {
    const { titleAuto, startDate, endDate } = state
    if (startDate && endDate && titleAuto) {
      return {
        ...state,
        title: makeAutoTitle(startDate, endDate)
      }
    } else {
      return state
    }
  }
}

const checkTitleUnique =
  (projectInfo: ProjectInfoWithMilestones): ReducerFunc =>
  (state) => {
    if (projectInfo.versions.find((v) => v.name === state.title)) {
      return {
        ...state,
        sameTitleExists: true,
        submittable: false
      }
    } else {
      return {
        ...state,
        sameTitleExists: false,
        submittable: true
      }
    }
  }

const compose =
  (...reducers: ReducerFunc[]): ReducerFunc =>
  (state, action) => {
    let accState = state
    reducers.forEach((reducer) => {
      accState = reducer(accState, action)
    })
    return accState
  }

const reduceState = (projectInfo: ProjectInfoWithMilestones): ReducerFunc =>
  compose(baseReducer, reduceStartDate, reduceEndDate, reduceTitle, checkTitleUnique(projectInfo))

const makeInitialState = (
  selectedMilestoneId: number,
  projectInfo: ProjectInfoWithMilestones,
  loaded: PartialViewState
): ViewState => {
  const startDate = DateUtil.beginningOfDay(new Date())
  return reduceState(projectInfo)(
    {
      ...loaded,
      selectedMilestone: projectInfo.versions.find((v) => v.id === selectedMilestoneId) || null,
      startDate,
      endDate: null,
      title: "",
      titleAuto: true,
      sameTitleExists: false,
      submittable: true,
      submitting: false,
      submitErrorMessage: null,
      submittingMessage: null
    },
    { src: "startDate", value: startDate }
  )
}

export const Reducers = {
  reduceState,
  makeInitialState
}
