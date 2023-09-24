import styled from "@emotion/styled"
import { useAtom, useAtomValue } from "jotai"
import React from "react"
import { BspConfState } from "../../state/BspConfState"
import { BspEnvState } from "../../state/BspEnvState"
import { IssueTypesState } from "../../state/ProjectInfoState"
import { HBox } from "../../ui/Box"
import { Button } from "../../ui/Button"
import { H2 } from "../../ui/H2"
import { Section } from "../../ui/Section"
import { Select } from "../../ui/Select"
import { OrderCustomFieldState } from "../state/OrderCustomFieldState"
import { AddIssueTypeView } from "./AddIssueTypeView"
import { i18n } from "./i18n"
import { AddIssueTypeFormState } from "./state/State"

export const ProjectSettings: React.FC = () => {
  const { lang } = useAtomValue(BspEnvState.atom)
  const [conf, setConf] = useAtom(BspConfState.atom)
  const issueTypes = useAtomValue(IssueTypesState.atom)
  const [orderCustomField, orderCustomFieldsDispatch] = useAtom(OrderCustomFieldState.atom)
  const errorMessageOnCustomField = useAtomValue(OrderCustomFieldState.errorAtom)
  const [form, setForm] = useAtom(AddIssueTypeFormState.atom)
  const t = i18n(lang)
  const id = (key: string) => `project.settingsForm.${key}`

  const selectIssueType = (issueTypeId: number) => {
    setConf({ ...conf, pbiIssueTypeId: issueTypeId })
  }

  return (
    <Root>
      <H2>{t.issueTypeLabel}</H2>
      <Section>
        {form.creating ? (
          <AddIssueTypeView />
        ) : (
          <HBox style={{ gap: 4 }}>
            <Select
              id={id("issueType")}
              onChange={(e) => {
                const elem = e.currentTarget
                if (elem.selectedIndex > 0) {
                  const issueType = issueTypes[elem.selectedIndex - 1]
                  selectIssueType(issueType.id)
                } else {
                  selectIssueType(0)
                }
              }}
              value={conf.pbiIssueTypeId || ""}
            >
              <option value=""></option>
              {issueTypes.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name}
                </option>
              ))}
            </Select>
            {!conf.pbiIssueTypeId && (
              <Button
                onClick={() =>
                  setForm((c) => {
                    c.creating = true
                  })
                }
              >
                {t.createLabel}
              </Button>
            )}
          </HBox>
        )}
      </Section>
      <H2>{t.customFieldTitle}</H2>
      <Section>
        {conf.pbiIssueTypeId ? (
          orderCustomField ? (
            <div>
              {t.storeOrderOn(orderCustomField.name)}
              <Button
                onClick={() => {
                  if (window.confirm(t.confirmDelete)) {
                    orderCustomFieldsDispatch(OrderCustomFieldState.Action.Delete(t)).then()
                  }
                }}
              >
                {t.deleteLabel}
              </Button>
            </div>
          ) : (
            <div>
              {t.customFieldNotExist}
              <Button
                onClick={() => {
                  orderCustomFieldsDispatch(OrderCustomFieldState.Action.Create(t)).then()
                }}
              >
                {t.createLabel}
              </Button>
              <div>{errorMessageOnCustomField}</div>
            </div>
          )
        ) : (
          <div>{t.setIssueType}</div>
        )}
      </Section>
      <H2>{t.viewOption}</H2>
      <Section>
        <input
          className="input-checkbox"
          type="checkbox"
          id="hide-completed-pbi"
          checked={conf.hideCompletedPbi}
          onChange={(e) => {
            setConf({ ...conf, hideCompletedPbi: e.target.checked })
          }}
        />
        <label className="checkbox-label" htmlFor="hide-completed-pbi">
          {t.hideCompletedPBI}
        </label>
      </Section>
    </Root>
  )
}

const Root = styled.div({
  padding: 16,
  height: "100%",
  overflowY: "auto"
})
