import { useAtom, useAtomValue } from "jotai"
import { Version } from "../../../backlog/ProjectInfo"
import { formInfoAtom, milestonesAtom } from "../../app/State"
import { UserLang } from "../../types"
import { MilestoneFormAction, milestoneFormAtom, MilestoneFormValues } from "./State"

type MilestoneModel = {
  setName: (value: string) => void
  setStartDate: (value: string) => void
  setEndDate: (value: string) => void
  cancel: () => void
  submit: () => void
  values: MilestoneFormValues
  lang: UserLang
  submittable: boolean
}

export const useMilestoneModel = (milestoneId?: number): MilestoneModel => {
  const [values, dispatch] = useAtom(milestoneFormAtom(milestoneId || 0))
  const milestones = useAtomValue(milestonesAtom)
  const formInfo = useAtomValue(formInfoAtom)
  return {
    lang: formInfo.lang,
    values,
    setName: (name) => {
      dispatch(MilestoneFormAction.SetName(name))
    },
    setStartDate: (value) => {
      dispatch(MilestoneFormAction.SetStartDate(value))
    },
    setEndDate: (value) => {
      dispatch(MilestoneFormAction.SetEndDate(value))
    },
    cancel: () => {
      dispatch(MilestoneFormAction.Cancel)
    },
    submit: () => {
      dispatch(MilestoneFormAction.Submit)
    },
    submittable: isSubmittable(values, milestones)
  }
}

const isSubmittable = (values: MilestoneFormValues, existing: ReadonlyArray<Version>): boolean => {
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
