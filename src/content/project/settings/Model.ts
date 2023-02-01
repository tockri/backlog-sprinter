import { Immutable } from "immer"
import { useAtom, useAtomValue } from "jotai"
import React from "react"
import { ErrorData } from "../../backlog/BacklogApiRequest"
import { CustomNumberField, IssueType, IssueTypeColor } from "../../backlog/ProjectInfo"
import { ImmerAtomSetter } from "../../util/JotaiUtil"
import {
  AppSetting,
  appSettingAtom,
  CustomFieldAction,
  formInfoAtom,
  IssueTypesAction,
  issueTypesAtom,
  OrderCustomFieldActionType,
  orderCustomFieldAtom
} from "../app/State"
import { ProjectFormInfo, UserLang } from "../types"
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
  const [setting, setSetting] = useAtom(appSettingAtom)
  const formInfo = useAtomValue(formInfoAtom)
  const issueTypes = useAtomValue(issueTypesAtom)
  const [orderCustomField, orderCustomFieldsDispatch] = useAtom(orderCustomFieldAtom)
  const [errorMessage, setErrorMessage] = React.useState("")
  const [form, setForm] = useAtom(issueTypeCreateAtom)

  return {
    lang: formInfo.lang,
    pbiIssueTypeId: setting.pbiIssueTypeId,
    issueTypes,
    selectIssueType: selectIssueType(setSetting),
    orderCustomField,
    createCustomField: createCustomField(formInfo, orderCustomFieldsDispatch, setErrorMessage),
    deleteCustomField: deleteCustomField(formInfo, orderCustomFieldsDispatch, setErrorMessage),
    errorMessageOnCustomField: errorMessage,
    startCreatingIssueType: () =>
      setForm((c) => {
        c.creating = true
      }),
    isCreatingIssueType: form.creating
  }
}

const selectIssueType = (set: ImmerAtomSetter<AppSetting>) => (issueTypeId: number) => {
  set((c) => {
    c.pbiIssueTypeId = issueTypeId
  })
}

const createCustomField =
  (
    formInfo: ProjectFormInfo,
    orderCustomFieldsDispatch: (action: OrderCustomFieldActionType) => Promise<void>,
    setErrorMessage: (message: string) => void
  ) =>
  async () => {
    try {
      await orderCustomFieldsDispatch(CustomFieldAction.Create())
    } catch (e) {
      const errorData = e as ErrorData
      const t = i18n(formInfo.lang)
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
    formInfo: ProjectFormInfo,
    orderCustomFieldsDispatch: (action: OrderCustomFieldActionType) => Promise<void>,
    setErrorMessage: (message: string) => void
  ) =>
  async () => {
    try {
      await orderCustomFieldsDispatch(CustomFieldAction.Delete())
      setErrorMessage("")
    } catch (e) {
      const errorData = e as ErrorData
      const first = errorData.errors[0]
      const t = i18n(formInfo.lang)
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
  const formInfo = useAtomValue(formInfoAtom)
  const [issueTypes, dispatch] = useAtom(issueTypesAtom)
  return {
    values,
    lang: formInfo.lang,
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
      await dispatch(IssueTypesAction.Create(values.name, values.color))
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
