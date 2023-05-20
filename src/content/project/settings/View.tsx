import styled from "@emotion/styled"
import React from "react"
import { HBox } from "../../ui/Box"
import { Button } from "../../ui/Button"
import { Select } from "../../ui/Select"
import { AddIssueTypeView } from "./AddIssueTypeView"
import { i18n } from "./i18n"
import { useSettingModel } from "./Model"

export const ProjectSettings: React.FC = () => {
  const model = React.useCallback(useSettingModel, [])()
  const t = i18n(model.lang)
  const id = (key: string) => `project.settingsForm.${key}`
  return (
    <Root>
      <H2>{t.issueTypeLabel}</H2>
      <div>
        {model.isCreatingIssueType ? (
          <AddIssueTypeView />
        ) : (
          <HBox style={{ gap: 4 }}>
            <Select
              id={id("issueType")}
              onChange={(e) => {
                const elem = e.currentTarget
                if (elem.selectedIndex > 0) {
                  const issueType = model.issueTypes[elem.selectedIndex - 1]
                  model.selectIssueType(issueType.id)
                } else {
                  model.selectIssueType(0)
                }
              }}
              value={model.pbiIssueTypeId || ""}
            >
              <option value=""></option>
              {model.issueTypes.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name}
                </option>
              ))}
            </Select>
            {!model.pbiIssueTypeId && <Button onClick={() => model.startCreatingIssueType()}>{t.createLabel}</Button>}
          </HBox>
        )}
      </div>
      <H2>{t.customFieldTitle}</H2>
      <div>
        {model.pbiIssueTypeId ? (
          model.orderCustomField ? (
            <div>
              {t.storeOrderOn(model.orderCustomField.name)}
              <Button
                onClick={() => {
                  if (window.confirm(t.confirmDelete)) {
                    model.deleteCustomField()
                  }
                }}
              >
                {t.deleteLabel}
              </Button>
            </div>
          ) : (
            <div>
              {t.customFieldNotExist}
              <Button onClick={() => model.addCustomField()}>{t.createLabel}</Button>
              <div>{model.errorMessageOnCustomField}</div>
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
