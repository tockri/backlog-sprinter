import { AddMilestoneInput, Version } from "@/content/backlog/ProjectInfoApi"
import { BoardConfState } from "@/content/board/state/BoardConfState"
import { ApiState } from "@/content/state/ApiState"
import { BspEnvState } from "@/content/state/BspEnvState"
import { MilestonesState, ProjectState, StatusesState } from "@/content/state/ProjectInfoState"
import { VelocityState } from "@/content/state/VelocityState"
import { AsyncHandler, JotaiUtil, StoreAtom } from "@/content/util/JotaiUtil"
import { DateUtil } from "@/util/DateUtil"
import produce, { Immutable } from "immer"
import { WritableDraft } from "immer/dist/types/types-external"
import { Getter, Setter } from "jotai"

export type FormValues = Immutable<{
  startDate: Date | null
  endDate: Date | null
  title: string
  titleAuto: boolean
  sameTitleExists: boolean
  submittable: boolean
  submitting: boolean
  submittingMessage: string | null
  submitErrorMessage: string | null
  selectedMilestone: Version | null
}>

type Init = {
  type: "Init"
}

type SetStartDate = {
  type: "StartDate"
  value: Date | null
}

type SetEndDate = {
  type: "EndDate"
  value: Date | null
}

type SetTitle = {
  type: "Title"
  value: string
}

type SetTitleAuto = {
  type: "TitleAuto"
  value: boolean
}

type Submit = {
  type: "Submit"
  onSuccess: (newMilestoneId: number) => void
}

type TestSubmitting = {
  type: "TestSubmitting"
  message: string
}

type Action = SetStartDate | SetEndDate | SetTitle | SetTitleAuto | Submit | Init | TestSubmitting

const makeAutoTitle = (startDate: Date, endDate: Date): string =>
  `${DateUtil.shortDateString(startDate)} ~ ${DateUtil.shortDateString(endDate)} sprint`

const checkSameTitle = (title: string, milestones: ReadonlyArray<Version>) => !!milestones.find((v) => v.name === title)

const setTitle = (d: WritableDraft<FormValues>, title: string, milestones: ReadonlyArray<Version>) => {
  d.title = title
  d.sameTitleExists = checkSameTitle(d.title, milestones)
  d.submittable = !d.sameTitleExists
}

const startDate: AsyncHandler<FormValues, SetStartDate> = async (curr, get, set, action) => {
  const conf = get(BoardConfState.atom)
  const milestones = await get(MilestonesState.atom)
  return produce(curr, (d) => {
    d.startDate = action.value
    if (d.startDate && conf.sprintDays > 0) {
      d.endDate = DateUtil.addDays(d.startDate, conf.sprintDays)
    }
    if (d.titleAuto && d.startDate && d.endDate) {
      setTitle(d, makeAutoTitle(d.startDate, d.endDate), milestones)
    }
  })
}

const endDate: AsyncHandler<FormValues, SetEndDate> = async (curr, get, set, action) => {
  const milestones = await get(MilestonesState.atom)
  return produce(curr, (d) => {
    const start = d.startDate
    const end = action.value
    d.endDate = end
    if (start && end) {
      if (start < end) {
        set(BoardConfState.atom, (cf) => {
          cf.sprintDays = DateUtil.diffDays(start, end)
        })
      }
      if (d.titleAuto) {
        setTitle(d, makeAutoTitle(start, end), milestones)
      }
    }
  })
}

const title: AsyncHandler<FormValues, SetTitle> = async (curr, get, set, action) => {
  const milestones = await get(MilestonesState.atom)
  return produce(curr, (d) => {
    setTitle(d, action.value, milestones)
    d.titleAuto = false
  })
}

const titleAuto: AsyncHandler<FormValues, SetTitleAuto> = async (curr, get, set, action) => {
  const milestones = await get(MilestonesState.atom)
  return produce(curr, (d) => {
    d.titleAuto = action.value
    if (action.value && d.startDate && d.endDate) {
      setTitle(d, makeAutoTitle(d.startDate, d.endDate), milestones)
    }
  })
}

const submit = async (curr: FormValues, get: Getter, set: Setter, action: Submit, storeAtom: StoreAtom<FormValues>) => {
  const update = (recipe: (d: WritableDraft<FormValues>) => void) => {
    set(storeAtom, (c) =>
      produce(c, (d) => {
        if (d) {
          recipe(d)
        }
      })
    )
  }
  const milestoneInput: AddMilestoneInput = {
    name: curr.title,
    startDate: curr.startDate,
    releaseDueDate: curr.endDate,
    description: ""
  }
  const conf = get(BoardConfState.atom)
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
              update((d) => {
                d.submittingMessage = `${issue.issueKey} ${issue.summary}`
              })
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
    update((d) => {
      d.submitting = false
      d.submittingMessage = null
    })
    action.onSuccess(createdMilestone.id)
  } catch (e) {
    const err = e as Error
    update((d) => {
      d.submitting = false
      d.submittable = false
      d.submitErrorMessage = `unknown error: ${err}`
    })
  }
  return curr
}

const mainAtom = JotaiUtil.asyncAtomWithAction<FormValues, Action>(
  async (get) => {
    const conf = get(BoardConfState.atom)
    const milestones = await get(MilestonesState.atom)
    const startDate = DateUtil.beginningOfDay(new Date())
    const endDate = DateUtil.addDays(startDate, Math.max(conf.sprintDays, 0))
    const title = makeAutoTitle(startDate, endDate)
    const sameTitleExists = checkSameTitle(title, milestones)
    const env = get(BspEnvState.atom)
    const selectedMilestone = milestones.find((ms) => ms.id === env.selectedMilestoneId) || null
    return {
      startDate,
      endDate,
      title: makeAutoTitle(startDate, endDate),
      titleAuto: true,
      sameTitleExists,
      submittable: !sameTitleExists,
      submitting: false,
      submitErrorMessage: null,
      submittingMessage: null,
      selectedMilestone
    }
  },
  (storeAtom) => (curr, get, set, action) => {
    switch (action.type) {
      case "Init":
        return curr
      case "StartDate":
        return startDate(curr, get, set, action)
      case "EndDate":
        return endDate(curr, get, set, action)
      case "Title":
        return title(curr, get, set, action)
      case "TitleAuto":
        return titleAuto(curr, get, set, action)
      case "Submit":
        submit(curr, get, set, action, storeAtom).then()
        return { ...curr, submitting: true, submittable: false }
      case "TestSubmitting":
        return { ...curr, submitting: true, submittingMessage: action.message }
    }
  }
)
mainAtom.onMount = (setAtom) => {
  setAtom({ type: "Init" }).then()
}

export const FormState = {
  atom: mainAtom,
  Action: {
    SetStartDate: (value: Date | null): SetStartDate => ({ type: "StartDate", value }),
    SetEndDate: (value: Date | null): SetEndDate => ({ type: "EndDate", value }),
    SetTitle: (value: string): SetTitle => ({ type: "Title", value }),
    SetTitleAuto: (value: boolean): SetTitleAuto => ({ type: "TitleAuto", value }),
    Submit: (onSuccess: (newMilestoneId: number) => void): Submit => ({
      type: "Submit",
      onSuccess
    })
  }
} as const
