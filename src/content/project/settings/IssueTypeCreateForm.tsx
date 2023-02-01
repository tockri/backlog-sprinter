import styled from "@emotion/styled"
import { useAtom, useAtomValue } from "jotai"
import React from "react"
import { IssueTypeColor, issueTypeColorClass } from "../../backlog/ProjectInfo"
import { HBox, VBox } from "../../ui/Box"
import { Button } from "../../ui/Button"
import { cnu } from "../../ui/cnu"
import { TextInput } from "../../ui/TextInput"
import { formInfoAtom, IssueTypesAction, issueTypesAtom } from "../app/State"
import { i18n } from "./i18n"
import { issueTypeCreateAtom } from "./State"

export const IssueTypeCreateForm: React.FC = () => {
  const [values, setValues] = useAtom(issueTypeCreateAtom)
  const formInfo = useAtomValue(formInfoAtom)
  const [issueTypes, dispatch] = useAtom(issueTypesAtom)
  const t = i18n(formInfo.lang)

  return (
    <Root>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          dispatch(IssueTypesAction.Create(values.name, values.color))
          setValues((c) => {
            c.creating = false
          })
          console.log("submit", values)
        }}
      >
        <div>{t.creatingIssueType}</div>
        <Row>
          <label htmlFor="create-issue-type-name">{t.createIssueTypeName}</label>
          <TextInput
            id="create-issue-type-name"
            type="text"
            onChange={(e) => {
              setValues((draft) => {
                draft.name = e.target.value
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
