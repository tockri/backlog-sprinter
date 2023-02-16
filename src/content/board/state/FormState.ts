import { Version } from "@/content/backlog/ProjectInfoApi"
import { ConfState } from "@/content/board/state/ConfState"
import { EnvState } from "@/content/board/state/EnvState"
import { MilestonesState } from "@/content/board/state/ProjectInfoState"
import { AsyncHandler, JotaiUtil } from "@/content/util/JotaiUtil"
import { DateUtil } from "@/util/DateUtil"
import produce, { Immutable } from "immer"

export type FormValues = Immutable<{
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

type Action = SetStartDate | SetEndDate | SetTitle | SetTitleAuto | Submit | Init

const makeAutoTitle = (startDate: Date, endDate: Date): string =>
  `${DateUtil.shortDateString(startDate)} ~ ${DateUtil.shortDateString(endDate)} sprint`

const checkSameTitle = (title: string, milestones: ReadonlyArray<Version>) => !!milestones.find((v) => v.name === title)

const startDate: AsyncHandler<FormValues, SetStartDate> = (curr, get, set, action) =>
  produce(curr, (d) => {
    const conf = get(ConfState.atom)
    d.startDate = action.value
    if (d.startDate && conf.sprintDays > 0) {
      d.endDate = DateUtil.addDays(d.startDate, conf.sprintDays)
    }
    if (d.titleAuto && d.startDate && d.endDate) {
      d.title = makeAutoTitle(d.startDate, d.endDate)
    }
  })

const endDate: AsyncHandler<FormValues, SetEndDate> = (curr, get, set, action) =>
  produce(curr, (d) => {
    const start = d.startDate
    const end = action.value
    d.endDate = end
    if (start && end) {
      if (start < end) {
        set(ConfState.atom, (cf) => {
          cf.sprintDays = DateUtil.diffDays(start, end)
        })
      }
      if (d.titleAuto) {
        d.title = makeAutoTitle(start, end)
      }
    }
  })

const title: AsyncHandler<FormValues, SetTitle> = (curr, get, set, action) =>
  produce(curr, (d) => {
    d.title = action.value
    d.titleAuto = false
  })

const titleAuto: AsyncHandler<FormValues, SetTitleAuto> = (curr, get, set, action) =>
  produce(curr, (d) => {
    d.titleAuto = action.value
    if (action.value && d.startDate && d.endDate) {
      d.title = makeAutoTitle(d.startDate, d.endDate)
    }
  })

const mainAtom = JotaiUtil.asyncAtomWithAction<FormValues, Action>(
  async (get) => {
    const env = get(EnvState.atom)
    const conf = get(ConfState.atom)
    const milestones = await get(MilestonesState.atom)
    const startDate = DateUtil.beginningOfDay(new Date())
    const endDate = DateUtil.addDays(startDate, Math.max(conf.sprintDays, 0))
    const title = makeAutoTitle(startDate, endDate)
    const sameTitleExists = checkSameTitle(title, milestones)
    return {
      selectedMilestone: milestones.find((v) => v.id === env.selectedMilestoneId) || null,
      startDate,
      endDate,
      title: makeAutoTitle(startDate, endDate),
      titleAuto: true,
      sameTitleExists,
      submittable: !sameTitleExists,
      submitting: false,
      submitErrorMessage: null,
      submittingMessage: null
    }
  },
  (curr, get, set, action) => {
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
      default:
        return curr
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
    Submit: (onSuccess: (newMilestoneId: number) => void): Submit => ({ type: "Submit", onSuccess })
  }
}
