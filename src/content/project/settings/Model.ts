import { Immutable, produce } from "immer"
import { useAtom, useAtomValue } from "jotai"
import React from "react"
import { ErrorData } from "../../backlog/BacklogApiRequest"
import { CustomNumberField, IssueType } from "../../backlog/ProjectInfo"
import { AppConfState } from "../app/state/AppConfState"
import { EnvState } from "../app/state/EnvState"
import { OrderCustomFieldAction, OrderCustomFieldState } from "../app/state/OrderCustomFieldState"
import { IssueTypesState } from "../app/state/ProjectInfoState"
import { UserLang } from "../types"
import { i18n } from "./i18n"
import { AddIssueTypeFormState } from "./state/State"

type SettingModel = Immutable<{
  lang: UserLang
  pbiIssueTypeId: number
  velocityWikiId: number
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
  const [conf, setConf] = useAtom(AppConfState.atom)
  const { lang } = useAtomValue(EnvState.atom)
  const issueTypes = useAtomValue(IssueTypesState.atom)
  const [orderCustomField, orderCustomFieldsDispatch] = useAtom(OrderCustomFieldState.atom)
  const [errorMessage, setErrorMessage] = React.useState("")
  const [form, setForm] = useAtom(AddIssueTypeFormState.atom)

  return {
    lang,
    pbiIssueTypeId: conf.pbiIssueTypeId,
    velocityWikiId: conf.velocityWikiId,
    issueTypes,
    selectIssueType: (issueTypeId: number) => {
      setConf((curr) =>
        produce(curr, (c) => {
          c.pbiIssueTypeId = issueTypeId
        })
      )
    },
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

const createCustomField =
  (
    lang: UserLang,
    orderCustomFieldsDispatch: (action: OrderCustomFieldAction) => Promise<void>,
    setErrorMessage: (message: string) => void
  ) =>
  async () => {
    try {
      await orderCustomFieldsDispatch(OrderCustomFieldState.Action.Create())
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
      await orderCustomFieldsDispatch(OrderCustomFieldState.Action.Delete())
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
