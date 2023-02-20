import { Immutable } from "immer"
import { useAtom, useAtomValue } from "jotai/index"
import { IssueType, IssueTypeColor } from "../../backlog/ProjectInfoApi"
import { BspEnvState, UserLang } from "../../state/BspEnvState"
import { IssueTypesState } from "../../state/ProjectInfoState"
import { AddIssueTypeFormState, AddIssueTypeFormValue } from "./state/State"

type AddIssueTypeModel = Immutable<{
  values: AddIssueTypeFormValue
  lang: UserLang
  issueTypes: IssueType[]
  onChangeName: (value: string) => void
  onChangeColor: (value: string) => void
  onSubmit: () => Promise<void>
  cancel: () => void
}>

export const useAddIssueTypeModel = (): AddIssueTypeModel => {
  const [values, setValues] = useAtom(AddIssueTypeFormState.atom)
  const { lang } = useAtomValue(BspEnvState.atom)
  const [issueTypes, dispatch] = useAtom(IssueTypesState.atom)
  return {
    values,
    lang,
    issueTypes,
    onChangeName: (value) => {
      setValues((c) => {
        c.name = value
      })
    },
    onChangeColor: (value) => {
      setValues((c) => {
        c.color = value as IssueTypeColor
      })
    },
    onSubmit: async () => {
      await dispatch(IssueTypesState.Action.Create(values.name, values.color))
      setValues((c) => {
        c.creating = false
      })
    },
    cancel: () => {
      setValues((c) => {
        c.creating = false
      })
    }
  }
}
