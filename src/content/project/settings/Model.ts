import { Immutable } from "immer"
import { useAtom, useAtomValue } from "jotai"
import React from "react"
import { ErrorData } from "../../backlog/BacklogApiRequest"
import { CustomNumberField, IssueType } from "../../backlog/ProjectInfo"
import { ImmerAtomSetter } from "../../util/JotaiUtil"
import {
  AppSetting,
  appSettingAtom,
  CustomFieldAction,
  formInfoAtom,
  issueTypesAtom,
  OrderCustomFieldActionType,
  orderCustomFieldAtom
} from "../app/State"
import { ProjectFormInfo, UserLang } from "../types"
import { i18n } from "./i18n"

type SettingModel = Immutable<{
  lang: UserLang
  pbiIssueTypeId: number
  issueTypes: IssueType[]
  selectIssueType: (issueTypeId: number) => void
  orderCustomField: CustomNumberField | null
  createCustomField: () => void
  deleteCustomField: () => void
  errorMessageOnCustomField: string | null
}>

export const useSettingModel = (): SettingModel => {
  const [setting, setSetting] = useAtom(appSettingAtom)
  const formInfo = useAtomValue(formInfoAtom)
  const issueTypes = useAtomValue(issueTypesAtom)
  const [orderCustomField, orderCustomFieldsDispatch] = useAtom(orderCustomFieldAtom)
  const [errorMessage, setErrorMessage] = React.useState("")
  return {
    lang: formInfo.lang,
    pbiIssueTypeId: setting.pbiIssueTypeId,
    issueTypes,
    selectIssueType: selectIssueType(setSetting),
    orderCustomField,
    createCustomField: createCustomField(formInfo, orderCustomFieldsDispatch, setErrorMessage),
    deleteCustomField: deleteCustomField(formInfo, orderCustomFieldsDispatch, setErrorMessage),
    errorMessageOnCustomField: errorMessage
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
