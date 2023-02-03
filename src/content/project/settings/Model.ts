import { Immutable } from "immer"
import { useAtom, useAtomValue } from "jotai"
import React from "react"
import { ErrorData } from "../../backlog/BacklogApiRequest"
import { CustomNumberField, IssueType, IssueTypeColor } from "../../backlog/ProjectInfo"
import { ImmerAtomSetter } from "../../util/JotaiUtil"
import { AppConfig, AppConfigValue } from "../app/state/AppConfig"
import { Environment } from "../app/state/Environment"
import { OrderCustomField, OrderCustomFieldAction } from "../app/state/OrderCustomField"
import { IssueTypes } from "../app/state/ProjectInfo"
import { UserLang } from "../types"
import { i18n } from "./i18n"
import { issueTypeCreateAtom, IssueTypeCreateForm } from "./State"

type SettingModel = Immutable<{
  lang: UserLang
  pbiIssueTypeId: number
  issueTypes: IssueType[]
  selectIssueType: (issueTypeId: number) => void
  orderCustomField: CustomNumberField | null
  createCustomField: () => void
  deleteCustomField: () => void
  errorMessageOnCustomField: string | null
  startCreatingIssueType: () => void
  isCreatingIssueType: boolean
}>

export const useSettingModel = (): SettingModel => {
  const [conf, setConf] = useAtom(AppConfig.atom)
  const { lang } = useAtomValue(Environment.atom)
  const issueTypes = useAtomValue(IssueTypes.atom)
  const [orderCustomField, orderCustomFieldsDispatch] = useAtom(OrderCustomField.atom)
  const [errorMessage, setErrorMessage] = React.useState("")
  const [form, setForm] = useAtom(issueTypeCreateAtom)

  return {
    lang,
    pbiIssueTypeId: conf.pbiIssueTypeId,
    issueTypes,
    selectIssueType: selectIssueType(setConf),
    orderCustomField,
    createCustomField: createCustomField(lang, orderCustomFieldsDispatch, setErrorMessage),
    deleteCustomField: deleteCustomField(lang, orderCustomFieldsDispatch, setErrorMessage),
    errorMessageOnCustomField: errorMessage,
    startCreatingIssueType: () =>
      setForm((c) => {
        c.creating = true
      }),
    isCreatingIssueType: form.creating
  }
}

const selectIssueType = (set: ImmerAtomSetter<AppConfigValue>) => (issueTypeId: number) => {
  set((c) => {
    c.pbiIssueTypeId = issueTypeId
  })
}

const createCustomField =
  (
    lang: UserLang,
    orderCustomFieldsDispatch: (action: OrderCustomFieldAction) => Promise<void>,
    setErrorMessage: (message: string) => void
  ) =>
  async () => {
    try {
      await orderCustomFieldsDispatch(OrderCustomField.Action.Create())
    } catch (e) {
      const errorData = e as ErrorData
      const t = i18n(lang)
      const first = errorData.errors[0]
      if (first.code === 2) {
        setErrorMessage(t.errorInsufficientLicense)
      } else if (first.code === 5) {
        setErrorMessage(t.errorNoRightForCreateCustomField)
      } else {
        setErrorMessage(first.message)
      }
    }
  }

const deleteCustomField =
  (
    lang: UserLang,
    orderCustomFieldsDispatch: (action: OrderCustomFieldAction) => Promise<void>,
    setErrorMessage: (message: string) => void
  ) =>
  async () => {
    try {
      await orderCustomFieldsDispatch(OrderCustomField.Action.Delete())
      setErrorMessage("")
    } catch (e) {
      const errorData = e as ErrorData
      const first = errorData.errors[0]
      const t = i18n(lang)
      if (first.code === 5) {
        setErrorMessage(t.errorNoRightForCreateCustomField)
      } else {
        setErrorMessage(first.message)
      }
    }
  }

type IssueTypeCreateModel = Immutable<{
  values: IssueTypeCreateForm
  lang: UserLang
  issueTypes: IssueType[]
  onChangeName: (value: string) => void
  onChangeColor: (value: string) => void
  onSubmit: () => Promise<void>
  cancel: () => void
}>

export const useIssueTypeCreateModel = (): IssueTypeCreateModel => {
  const [values, setValues] = useAtom(issueTypeCreateAtom)
  const { lang } = useAtomValue(Environment.atom)
  const [issueTypes, dispatch] = useAtom(IssueTypes.atom)
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
      await dispatch(IssueTypes.Action.Create(values.name, values.color))
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
