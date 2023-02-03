import { useAtom, useAtomValue } from "jotai"
import { Version } from "../../../backlog/ProjectInfo"
import { Environment } from "../../app/state/Environment"
import { Milestones } from "../../app/state/ProjectInfo"
import { UserLang } from "../../types"
import { MilestoneForm, MilestoneFormValues } from "../state/MilestoneForm"

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
  const [values, dispatch] = useAtom(MilestoneForm.atom(milestoneId || 0))
  const milestones = useAtomValue(Milestones.atom)
  const { lang } = useAtomValue(Environment.atom)
  return {
    lang,
    values,
    setName: (name) => {
      dispatch(MilestoneForm.Action.SetName(name))
    },
    setStartDate: (value) => {
      dispatch(MilestoneForm.Action.SetStartDate(value))
    },
    setEndDate: (value) => {
      dispatch(MilestoneForm.Action.SetEndDate(value))
    },
    cancel: () => {
      dispatch(MilestoneForm.Action.Cancel)
    },
    submit: () => {
      dispatch(MilestoneForm.Action.Submit)
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
