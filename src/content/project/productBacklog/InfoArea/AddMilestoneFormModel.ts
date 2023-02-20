import { DateUtil } from "@/util/DateUtil"
import produce, { Immutable } from "immer"
import { useAtomValue, useSetAtom } from "jotai"
import React from "react"
import { AddMilestoneInput, Version } from "../../../backlog/ProjectInfoApi"
import { BspEnvState, UserLang } from "../../../state/BspEnvState"
import { MilestonesState } from "../../../state/ProjectInfoState"
import { ItemSelectionState } from "../state/ItemSelectionState"
import { PBIListState } from "../state/PBIListState"

type Values = Immutable<AddMilestoneInput>

type AddMilestoneFormModel = Immutable<{
  values: Values
  lang: UserLang
  setName: (value: string) => void
  isNameDup: boolean
  setDescription: (value: string) => void
  setStartDate: (value: string) => void
  setReleaseDueDate: (value: string) => void
  cancel: () => void
  submit: () => void
  submittable: boolean
}>

export const useMilestoneFormModel = (): AddMilestoneFormModel => {
  const { lang } = useAtomValue(BspEnvState.atom)
  const [values, setValues] = React.useState<Values>({
    name: "",
    description: "",
    startDate: null,
    releaseDueDate: null
  })
  const milestones = useAtomValue(MilestonesState.atom)
  const selDispatch = useSetAtom(ItemSelectionState.atom)
  const pbDispatch = useSetAtom(PBIListState.atom)
  const submittable = isSubmittable(values, milestones)
  return {
    values,
    lang,
    submittable,
    setName: (value) => {
      setValues((curr) =>
        produce(curr, (d) => {
          d.name = value
        })
      )
    },
    isNameDup: !!values.name && !!milestones.find((ms) => ms.name === values.name),
    setDescription: (value) => {
      setValues((curr) =>
        produce(curr, (d) => {
          d.description = value
        })
      )
    },
    setStartDate: (value) => {
      const date = DateUtil.parseDate(value)
      if (date) {
        setValues((curr) =>
          produce(curr, (d) => {
            d.startDate = date
          })
        )
      }
    },
    setReleaseDueDate: (value) => {
      const date = DateUtil.parseDate(value)
      if (date) {
        setValues((curr) =>
          produce(curr, (d) => {
            d.releaseDueDate = date
          })
        )
      }
    },
    cancel: () => {
      selDispatch(ItemSelectionState.Action.Deselect)
    },
    submit: async () => {
      await pbDispatch(PBIListState.Action.AddMilestone(values))
      selDispatch(ItemSelectionState.Action.Deselect)
    }
  }
}

const isSubmittable = (values: Values, milestones: ReadonlyArray<Version>): boolean => {
  const { name, startDate, releaseDueDate } = values
  return !!(
    name &&
    startDate &&
    releaseDueDate &&
    startDate.getTime() <= releaseDueDate.getTime() &&
    !milestones.find((ms) => ms.name === name)
  )
}
