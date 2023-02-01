import styled from "@emotion/styled"
import React from "react"
import { HBox } from "../../ui/Box"
import { Button } from "../../ui/Button"
import { Select } from "../../ui/Select"
import { i18n } from "./i18n"
import { IssueTypeCreateForm } from "./IssueTypeCreateForm"
import { useSettingModel } from "./Model"

export const ProjectSettings: React.FC = () => {
  const vm = useSettingModel()
  const t = i18n(vm.lang)
  const id = (key: string) => `project.settingsForm.${key}`
  return (
    <Root>
      <H2>{t.issueTypeLabel}</H2>
      <div className="form-element__item">
        {vm.isCreatingIssueType ? (
          <IssueTypeCreateForm />
        ) : (
          <HBox style={{ gap: 4 }}>
            <Select
              id={id("issueType")}
              onChange={(e) => {
                const elem = e.currentTarget
                if (elem.selectedIndex > 0) {
                  const issueType = vm.issueTypes[elem.selectedIndex - 1]
                  vm.selectIssueType(issueType.id)
                } else {
                  vm.selectIssueType(0)
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
            </Select>
            {!vm.pbiIssueTypeId && <Button onClick={() => vm.startCreatingIssueType()}>{t.createLabel}</Button>}
          </HBox>
        )}
      </div>
      <H2>{t.customFieldTitle}</H2>
      <div className="form-element__item">
        {vm.pbiIssueTypeId ? (
          vm.orderCustomField ? (
            <div>
              {t.storeOrderOn(vm.orderCustomField.name)}
              <Button
                onClick={() => {
                  if (window.confirm(t.confirmDelete)) {
                    vm.deleteCustomField()
                  }
                }}
              >
                {t.deleteLabel}
              </Button>
            </div>
          ) : (
            <div>
              {t.customFieldNotExist}
              <Button onClick={() => vm.createCustomField()}>{t.createLabel}</Button>
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

const H2 = styled.h2({
  fontSize: 16,
  padding: "4px 0",
  fontWeight: "normal"
})
