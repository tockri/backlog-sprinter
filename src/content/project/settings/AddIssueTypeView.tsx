import styled from "@emotion/styled"
import { useAtom, useAtomValue } from "jotai"
import React from "react"
import { IssueTypeColor, issueTypeColorClass } from "../../backlog/ProjectInfoApi"
import { BspEnvState } from "../../state/BspEnvState"
import { IssueTypesState } from "../../state/ProjectInfoState"
import { HBox, VBox } from "../../ui/Box"
import { Button } from "../../ui/Button"
import { cnu } from "../../ui/cnu"
import { TextInput } from "../../ui/TextInput"
import { i18n } from "./i18n"
import { AddIssueTypeFormState } from "./state/State"

export const AddIssueTypeView: React.FC = () => {
  const [values, setValues] = useAtom(AddIssueTypeFormState.atom)
  const { lang } = useAtomValue(BspEnvState.atom)
  const [issueTypes, dispatch] = useAtom(IssueTypesState.atom)
  const t = i18n(lang)

  return (
    <Root>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          await dispatch(IssueTypesState.Action.Create(values.name, values.color))
          setValues((c) => {
            c.creating = false
          })
        }}
      >
        <div>{t.creatingIssueType}</div>
        <Row>
          <label htmlFor="create-issue-type-name">{t.createIssueTypeName}</label>
          <TextInput
            id="create-issue-type-name"
            type="text"
            onChange={(e) => {
              setValues((c) => {
                c.name = e.target.value
              })
            }}
            maxLength={20}
            size={15}
            value={values.name}
          />
        </Row>
        <Row>
          <label htmlFor={`color-${values.color}`}>{t.createIssueTypeColor}</label>
          <div>
            {Object.values(IssueTypeColor).map((color, idx) => (
              <PillWrap key={idx} className={cnu({ wrap: idx % 5 === 0 })}>
                <input
                  type="radio"
                  value={color}
                  id={`color-${color}`}
                  name="color"
                  checked={color === values.color}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setValues((c) => {
                        c.color = e.target.value as IssueTypeColor
                      })
                    }
                  }}
                />
                <ColorPill htmlFor={`color-${color}`} className={issueTypeColorClass(color)}>
                  {values.name || t.createIssueTypeName}
                </ColorPill>
              </PillWrap>
            ))}
          </div>
        </Row>
        <Row>
          <strong>{t.existing}</strong>
          <ExistingPane>
            {issueTypes.map((it, idx) => (
              <ColorPill key={idx} className={issueTypeColorClass(it.color)}>
                {it.name}
              </ColorPill>
            ))}
          </ExistingPane>
        </Row>
        <ButtonBox>
          <Button
            type="button"
            onClick={() =>
              setValues((c) => {
                c.creating = false
              })
            }
          >
            {t.cancelLabel}
          </Button>
          <Button type="submit">{t.createLabel}</Button>
        </ButtonBox>
      </form>
    </Root>
  )
}

const Root = styled.div({
  margin: "16px 0"
})

const ButtonBox = styled(HBox)({
  marginTop: 8,
  marginBottom: 8,
  gap: 12
})

const Row = styled(VBox)({
  alignItems: "flex-start",
  gap: 4,
  marginTop: 12,
  marginBottom: 12
})

const PillWrap = styled.span({
  marginRight: 16,
  "&.wrap::before": {
    content: '""',
    display: "block"
  }
})

const ColorPill = styled.label({
  borderRadius: 10,
  height: 16,
  color: "white",
  paddingLeft: 8,
  paddingRight: 8,
  verticalAlign: "middle",
  whiteSpace: "nowrap"
})

const ExistingPane = styled.div({
  border: "1px solid #eecccc",
  backgroundColor: "#ffeeee",
  borderRadius: 4,
  padding: 8,
  " label": {
    marginRight: 16
  }
})
