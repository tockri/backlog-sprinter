import produce, { Immutable } from "immer"
import { useAtomValue, useSetAtom } from "jotai"
import React from "react"
import { DateUtil } from "../../../../util/DateUtil"
import { AddMilestoneInput, Version } from "../../../backlog/ProjectInfo"
import { Environment } from "../../app/state/Environment"
import { Milestones } from "../../app/state/ProjectInfo"
import { UserLang } from "../../types"
import { ProductBacklog } from "../state/ProductBacklog"
import { SelectedItem } from "../state/SelectedItem"

type Values = Immutable<AddMilestoneInput>

type MilestoneFormModel = {
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
}

export const useMilestoneFormModel = (): MilestoneFormModel => {
  const { lang } = useAtomValue(Environment.atom)
  const [values, setValues] = React.useState<Values>({
    name: "",
    description: "",
    startDate: null,
    releaseDueDate: null
  })
  const milestones = useAtomValue(Milestones.atom)
  const selDispatch = useSetAtom(SelectedItem.atom)
  const pbDispatch = useSetAtom(ProductBacklog.atom)
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
      selDispatch(SelectedItem.Action.Deselect)
    },
    submit: async () => {
      await pbDispatch(ProductBacklog.Action.AddMilestone(values))
      selDispatch(SelectedItem.Action.Deselect)
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
