import { useAtom, useAtomValue } from "jotai"
import { formInfoAtom } from "../../app/State"
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
}

export const useMilestoneCreateModel = (): MilestoneCreateModel => {
  const [values, dispatch] = useAtom(milestoneCreateFormAtom)
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
    }
  }
}
