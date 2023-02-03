import { useAtom, useAtomValue } from "jotai"
import { Version } from "../../../backlog/ProjectInfo"
import { formInfoAtom, milestonesAtom } from "../../app/State"
import { UserLang } from "../../types"
import { MilestoneCreate, MilestoneCreateForm, milestoneCreateFormAtom } from "./State"

type MilestoneCreateModel = {
  setName: (value: string) => void
  setStartDate: (value: string) => void
  setEndDate: (value: string) => void
  cancel: () => void
  submit: () => void
  values: MilestoneCreateForm
  lang: UserLang
  submittable: boolean
}

export const useMilestoneCreateModel = (): MilestoneCreateModel => {
  const [values, dispatch] = useAtom(milestoneCreateFormAtom)
  const milestones = useAtomValue(milestonesAtom)
  const formInfo = useAtomValue(formInfoAtom)
  return {
    lang: formInfo.lang,
    values,
    setName: (name) => {
      dispatch(MilestoneCreate.SetName(name))
    },
    setStartDate: (value) => {
      dispatch(MilestoneCreate.SetStartDate(value))
    },
    setEndDate: (value) => {
      dispatch(MilestoneCreate.SetEndDate(value))
    },
    cancel: () => {
      dispatch(MilestoneCreate.Cancel)
    },
    submit: () => {
      dispatch(MilestoneCreate.Submit)
    },
    submittable: isSubmittable(values, milestones)
  }
}

const isSubmittable = (values: MilestoneCreateForm, existing: ReadonlyArray<Version>): boolean => {
  const { name, startDate, endDate } = values
  if (!name || !startDate || !endDate) {
    return false
  } else if (existing.find((v) => v.name === name)) {
    return false
  } else if (startDate.getTime() >= endDate.getTime()) {
    return false
  }

  return true
}
