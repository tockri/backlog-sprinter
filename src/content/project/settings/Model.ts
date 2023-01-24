import { Immutable } from "immer"
import { WritableDraft } from "immer/dist/types/types-external"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import React from "react"
import { BacklogApi } from "../../backlog/BacklogApiForReact"
import { ErrorData } from "../../backlog/BacklogApiRequest"
import { CustomField, CustomFieldTypes, CustomNumberField, IssueType } from "../../backlog/ProjectInfo"
import { ImmerAtomSetter } from "../../util/JotaiUtil"
import {
  AppSetting,
  appSettingAtom,
  backlogApiAtom,
  customFieldsAtom,
  formInfoAtom,
  issueTypesAtom,
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
  const [issueTypes, setIssueTypes] = useAtom(issueTypesAtom)
  const setCustomFields = useSetAtom(customFieldsAtom)
  const orderCustomField = useAtomValue(orderCustomFieldAtom)
  const api = useAtomValue(backlogApiAtom)
  const [errorMessage, setErrorMessage] = React.useState("")
  return {
    lang: formInfo.lang,
    pbiIssueTypeId: setting.pbiIssueTypeId,
    issueTypes,
    selectIssueType: selectIssueType(setSetting),
    orderCustomField,
    createCustomField: createCustomField(
      setting,
      setSetting,
      setCustomFields,
      setErrorMessage,
      formInfo,
      orderCustomField,
      api
    ),
    deleteCustomField: deleteCustomField(setCustomFields, setErrorMessage, formInfo, orderCustomField, api),
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
    setting: AppSetting,
    setSetting: ImmerAtomSetter<AppSetting>,
    setCustomFields: ImmerAtomSetter<CustomField[]>,
    setErrorMessage: (message: string) => void,
    formInfo: ProjectFormInfo,
    orderCustomField: CustomNumberField | null,
    api: BacklogApi
  ) =>
  async () => {
    const projectKey = formInfo.projectKey
    const issueTypeId = setting.pbiIssueTypeId
    if (projectKey && issueTypeId) {
      try {
        const created = (await api.projectInfo.createCustomField(projectKey, {
          typeId: CustomFieldTypes.Number,
          name: `__PBI_ORDER__${issueTypeId}__`,
          applicableIssueTypes: [issueTypeId],
          description: "",
          required: false
        })) as CustomNumberField
        if (created) {
          setCustomFields((cfs) => {
            cfs.push(created as WritableDraft<CustomNumberField>)
          })
        }
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
  }

const deleteCustomField =
  (
    setCustomFields: ImmerAtomSetter<CustomField[]>,
    setErrorMessage: (message: string) => void,
    formInfo: ProjectFormInfo,
    orderCustomField: CustomNumberField | null,
    api: BacklogApi
  ) =>
  async () => {
    if (orderCustomField) {
      const delId = orderCustomField.id
      try {
        const deleted = await api.projectInfo.deleteCustomField(formInfo.projectKey, delId)
        setCustomFields((cfs) => {
          const idx = cfs.findIndex((cf) => cf.id === deleted.id)
          if (idx >= 0) {
            cfs.splice(idx, 1)
          }
        })
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
  }
