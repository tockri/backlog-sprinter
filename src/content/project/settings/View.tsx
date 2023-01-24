import styled from "@emotion/styled"
import React from "react"
import { i18n } from "./i18n"
import { useSettingModel } from "./Model"

export const ProjectSettings: React.FC = () => {
  const vm = useSettingModel()
  const t = i18n(vm.lang)
  const id = (key: string) => `project.settingsForm.${key}`
  return (
    <Root>
      <div className="form-element__item">
        <label className="form-element__label" htmlFor={id("issueType")}>
          {t.issueTypeLabel}
        </label>
        <select
          id={id("issueType")}
          onChange={(e) => {
            const elem = e.currentTarget
            if (elem.selectedIndex > 0) {
              const issueType = vm.issueTypes[elem.selectedIndex - 1]
              vm.selectIssueType(issueType.id)
            }
          }}
          value={vm.pbiIssueTypeId || ""}
        >
          <option value=""></option>
          {vm.issueTypes.map((it) => (
            <option key={it.id} value={it.id}>
              {it.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-element__item">
        <label className="form-element__label" htmlFor={id("customField")}>
          {t.customFieldTitle}
        </label>
        {vm.pbiIssueTypeId ? (
          vm.orderCustomField ? (
            <div>
              {t.storeOrderOn(vm.orderCustomField.name)}
              <button
                onClick={() => {
                  if (window.confirm(t.confirmDelete)) {
                    vm.deleteCustomField()
                  }
                }}
              >
                {t.deleteLabel}
              </button>
            </div>
          ) : (
            <div>
              {t.customFieldNotExist}
              <button onClick={() => vm.createCustomField()}>{t.createLabel}</button>
              <div>{vm.errorMessageOnCustomField}</div>
            </div>
          )
        ) : (
          <div>{t.setIssueType}</div>
        )}
      </div>
    </Root>
  )
}

const Root = styled.div({
  padding: 12
})
