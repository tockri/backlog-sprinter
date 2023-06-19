import { Draft, Immutable, produce } from "immer"
import { DateUtil } from "../../../../util/DateUtil"
import { AddMilestoneInput, Version } from "../../../backlog/ProjectInfoApi"
import { ApiState } from "../../../state/ApiState"
import { MilestonesState, ProjectState, StatusesState } from "../../../state/ProjectInfoState"
import { VelocityState } from "../../../state/VelocityState"
import { AsyncHandler, JotaiUtil } from "../../../util/JotaiUtil"
import { SprintConfState } from "./SprintConfState"

export type FormValues = Immutable<{
  startDate: Date | null
  endDate: Date | null
  nameSuffix: string
  sameTitleExists: boolean
  submittable: boolean
  milestoneOptions: ReadonlyArray<Version>
  selectedMilestoneId: number | undefined
  selectedMilestone: Version | undefined
}>

type SetStartDate = {
  type: "StartDate"
  value: Date | null
}

type SetEndDate = {
  type: "EndDate"
  value: Date | null
}

type SetNamePrefix = {
  type: "NamePrefix"
  value: string
}

type SetTitleAuto = {
  type: "TitleAuto"
  value: boolean
}

type SelectMilestone = {
  type: "SelectMilestone"
  milestoneId: number | null
}

type Submit = {
  type: "Submit"
  onSuccess: (newMilestoneId: number) => void
  onError: (errorMessage: string) => void
  onProgress: (message: string) => void
}

type Action = SetStartDate | SetEndDate | SetNamePrefix | SetTitleAuto | Submit | SelectMilestone

const checkSameTitleExists = (d: Draft<FormValues>, prefix: string, milestones: ReadonlyArray<Version>) => {
  d.sameTitleExists = !!milestones.find((v) => v.name === (prefix || "") + d.nameSuffix)
  d.submittable = !d.sameTitleExists
}

const updateNameSuffix = (d: Draft<FormValues>) => {
  if (d.startDate && d.endDate) {
    d.nameSuffix = `${DateUtil.shortDateString(d.startDate)} ~ ${DateUtil.shortDateString(d.endDate)} sprint`
  }
}

const startDate: AsyncHandler<FormValues, Action> = async (curr, get, set, _action) => {
  const action = _action as SetStartDate
  const conf = get(SprintConfState.atom)
  const milestones = await get(MilestonesState.atom)
  return produce(curr, (d) => {
    d.startDate = action.value
    if (d.startDate && conf.sprintDays > 0) {
      d.endDate = DateUtil.addDays(d.startDate, conf.sprintDays)
    }
    updateNameSuffix(d)
    checkSameTitleExists(d, conf.namePrefix, milestones)
  })
}

const endDate: AsyncHandler<FormValues, Action> = async (curr, get, set, _action) => {
  const action = _action as SetEndDate
  const conf = get(SprintConfState.atom)
  const milestones = await get(MilestonesState.atom)
  return produce(curr, (d) => {
    const start = d.startDate
    const end = action.value
    d.endDate = end
    if (start && end) {
      if (start < end) {
        set(SprintConfState.atom, {
          sprintDays: DateUtil.diffDays(start, end)
        })
      }
    }
    updateNameSuffix(d)
    checkSameTitleExists(d, conf.namePrefix, milestones)
  })
}

const namePrefix: AsyncHandler<FormValues, Action> = async (curr, get, set, _action) => {
  const action = _action as SetNamePrefix
  set(SprintConfState.atom, { namePrefix: action.value })
  const milestones = await get(MilestonesState.atom)
  return produce(curr, (d) => {
    checkSameTitleExists(d, action.value, milestones)
  })
}

const selectMilestone: AsyncHandler<FormValues, Action> = async (curr, get, set, _action) => {
  const action = _action as SelectMilestone
  const selectedMilestone =
    (action.milestoneId && curr.milestoneOptions.find((ms) => ms.id === action.milestoneId)) || undefined

  return {
    ...curr,
    selectedMilestone,
    selectedMilestoneId: selectedMilestone?.id
  }
}

const submit: AsyncHandler<FormValues, Action> = async (curr, get, set, _action) => {
  const action = _action as Submit
  const conf = get(SprintConfState.atom)
  const milestoneInput: AddMilestoneInput = {
    name: conf.namePrefix + curr.nameSuffix,
    startDate: curr.startDate,
    releaseDueDate: curr.endDate,
    description: ""
  }
  const api = get(ApiState.atom)
  const project = await get(ProjectState.atom)
  const statuses = await get(StatusesState.atom)
  const selectedMilestone = curr.selectedMilestone
  try {
    const createdMilestone = await api.projectInfo.addMilestone(project.id, milestoneInput)
    if (selectedMilestone) {
      if (conf.moveUnclosed) {
        const unclosed = await api.issue.searchUnclosedInMilestone(project.id, statuses, selectedMilestone.id)
        await api.issue.bulkChangeMilestone(
          unclosed.map((i) => i.id),
          createdMilestone.id,
          (id) => {
            const issue = unclosed.find((issue) => issue.id === id)
            if (issue) {
              action.onProgress(`${issue.issueKey} ${issue.summary}`)
            }
          }
        )
      }
      if (conf.archiveCurrent) {
        await api.projectInfo.archiveMilestone(project.id, selectedMilestone)
      }
      if (conf.recordVelocity) {
        await set(
          VelocityState.atom,
          VelocityState.Action.Record(selectedMilestone, (saved) => {
            console.log("Wiki saved", { saved })
          })
        )
      }
    }
    action.onSuccess(createdMilestone.id)
  } catch (e) {
    const err = e as Error
    action.onError(`unknown error: ${err}`)
  }
  return curr
}

const findInitialMilestone = (milestones: ReadonlyArray<Version>): Version | undefined => {
  const selected = new URLSearchParams(location.search).get("milestone")
  if (selected) {
    const selectedId = parseInt(selected)
    const selectedMs = milestones.find((ms) => ms.id === selectedId)
    if (selectedMs) {
      return selectedMs
    }
  }
  if (milestones.length === 1) {
    return milestones[0]
  }
  const named = milestones.filter((ms) => ms.name.includes("sprint"))
  if (named.length === 1) {
    return named[0]
  } else {
    const today = DateUtil.beginningOfDay(new Date())
    const ongoing = named.find((ms) => {
      const sd = DateUtil.parseDate(ms.startDate)
      const ed = DateUtil.parseDate(ms.releaseDueDate)
      return sd && ed && sd <= today && today <= ed
    })
    if (ongoing) {
      return ongoing
    }
  }
}

const filterMilestones = (milestones: ReadonlyArray<Version>): ReadonlyArray<Version> =>
  milestones.filter((ms) => {
    return !ms.archived && ms.startDate && ms.releaseDueDate
  })

const mainAtom = JotaiUtil.asyncAtomWithAction<FormValues, Action>(
  async (get) => {
    const conf = get(SprintConfState.atom)
    const milestones = await get(MilestonesState.atom)
    const startDate = DateUtil.beginningOfDay(new Date())
    const endDate = DateUtil.addDays(startDate, Math.max(conf.sprintDays, 0))
    const milestoneOptions = filterMilestones(milestones)
    const selectedMilestone = findInitialMilestone(milestoneOptions)
    return produce<FormValues>(
      {
        startDate,
        endDate,
        nameSuffix: "",
        milestoneOptions,
        selectedMilestone,
        selectedMilestoneId: selectedMilestone?.id,
        sameTitleExists: false,
        submittable: true
      },
      (d) => {
        updateNameSuffix(d)
        checkSameTitleExists(d, conf.namePrefix, milestones)
      }
    )
  },

  JotaiUtil.composeAsyncHandlers({
    StartDate: startDate,
    EndDate: endDate,
    NamePrefix: namePrefix,
    Submit: submit,
    SelectMilestone: selectMilestone
  })
)

export const FormState = {
  atom: mainAtom,
  Action: {
    SetStartDate: (value: Date | null): SetStartDate => ({ type: "StartDate", value }),
    SetEndDate: (value: Date | null): SetEndDate => ({ type: "EndDate", value }),
    SetNamePrefix: (value: string): SetNamePrefix => ({ type: "NamePrefix", value }),
    SetTitleAuto: (value: boolean): SetTitleAuto => ({ type: "TitleAuto", value }),
    SelectMilestone: (milestoneId: number | null): SelectMilestone => ({ type: "SelectMilestone", milestoneId }),
    Submit: (props: {
      onSuccess: (newMilestoneId: number) => void
      onError: (errorMessage: string) => void
      onProgress: (message: string) => void
    }): Submit => ({
      type: "Submit",
      ...props
    })
  }
} as const
