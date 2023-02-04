import { Immutable } from "immer"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { atomWithImmer } from "jotai-immer"
import { DateUtil } from "../../../../util/DateUtil"
import { AddMilestoneInput } from "../../../backlog/ProjectInfo"
import { Environment } from "../../app/state/Environment"
import { UserLang } from "../../types"
import { ProductBacklog } from "../state/ProductBacklog"
import { SelectedItem } from "../state/SelectedItem"

type Values = Immutable<
  AddMilestoneInput & {
    errorMessage: string | null
  }
>

const valuesAtom = atomWithImmer<Values>({
  name: "",
  description: "",
  startDate: null,
  releaseDueDate: null,
  errorMessage: null
})

type MilestoneFormModel = {
  values: Values
  lang: UserLang
  setName: (value: string) => void
  setDescription: (value: string) => void
  setStartDate: (value: string) => void
  setReleaseDueDate: (value: string) => void
  cancel: () => void
  submit: () => void
}

export const useMilestoneFormModel = (): MilestoneFormModel => {
  const { lang } = useAtomValue(Environment.atom)
  const [values, setValues] = useAtom(valuesAtom)
  const selDispatch = useSetAtom(SelectedItem.atom)
  const pbDispatch = useSetAtom(ProductBacklog.atom)
  return {
    values,
    lang,
    setName: (value) => {
      setValues((d) => {
        d.name = value
      })
    },
    setDescription: (value) => {
      setValues((d) => {
        d.description = value
      })
    },
    setStartDate: (value) => {
      const date = DateUtil.parseDate(value)
      if (date) {
        setValues((d) => {
          d.startDate = date
        })
      }
    },
    setReleaseDueDate: (value) => {
      const date = DateUtil.parseDate(value)
      if (date) {
        setValues((d) => {
          d.releaseDueDate = date
        })
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
