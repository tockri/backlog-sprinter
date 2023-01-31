import styled from "@emotion/styled"
import { useAtom, useAtomValue } from "jotai"
import React from "react"
import { IssueTypeColor } from "../../backlog/ProjectInfo"
import { formInfoAtom, issueTypesAtom } from "../app/State"
import { i18n } from "./i18n"
import { issueTypeCreateAtom } from "./State"

export const IssueTypeCreateForm: React.FC = () => {
  const [values, setValues] = useAtom(issueTypeCreateAtom)
  const formInfo = useAtomValue(formInfoAtom)
  const issueTypes = useAtomValue(issueTypesAtom)
  const t = i18n(formInfo.lang)

  return (
    <div>
      <form
        onSubmit={() => {
          console.log("submit", values)
        }}
      >
        <div>{t.creatingIssueType}</div>
        <div>
          <label htmlFor="create-issue-type-name">{t.createIssueTypeName}</label>
          <input
            id="create-issue-type-name"
            type="text"
            onChange={(e) => {
              setValues((draft) => {
                draft.name = e.target.value
              })
            }}
            maxLength={20}
            size={10}
            value={values.name}
          />
        </div>
        <div>
          {Object.entries(IssueTypeColor).map(([cls, color], idx) => (
            <span key={idx}>
              <input
                type="radio"
                value={color}
                id={`color-${idx}`}
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
              <ColorPill htmlFor={`color-${idx}`} className={cls.replace(/_/g, "-")}>
                {values.name || t.createIssueTypeName}
              </ColorPill>
              {idx % 5 === 4 ? <br /> : null}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setValues((c) => {
              c.creating = false
            })
          }
        >
          Cancel
        </button>
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

const ColorPill = styled.label({
  borderRadius: 8,
  height: 16,
  color: "white",
  paddingLeft: 8,
  paddingRight: 8,
  marginRight: 16
})
