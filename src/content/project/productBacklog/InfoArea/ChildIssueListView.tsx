import styled from "@emotion/styled"
import { useAtom, useAtomValue } from "jotai"
import React from "react"
import { IssueData } from "../../../backlog/Issue"
import { HBox } from "../../../ui/Box"
import { Draggable } from "../../../ui/DragAndDrop"
import { formInfoAtom } from "../../app/State"
import { ChildIssueAction, ChildIssueActionType, childIssueAtom } from "../State"
import { StatusView } from "../StatusView"
import { i18n } from "./i18n"

type ChildIssueListViewProps = {
  parentIssueId: number
}

export const ChildIssueListView: React.FC<ChildIssueListViewProps> = (props) => {
  const { parentIssueId } = props
  const [children, dispatch] = useAtom(childIssueAtom(parentIssueId))
  const formInfo = useAtomValue(formInfoAtom)
  const t = i18n(formInfo.lang)

  return children.length === 0 ? null : (
    <div>
      <Heading>
        <svg role="image" className="icon -small">
          <use xlinkHref="/images/svg/sprite.symbol.svg#icon_subtasking"></use>
        </svg>
        {t.childIssue}
      </Heading>
      {children.map((issue) => (
        <ChildIssueView key={issue.id} issue={issue} dispatch={dispatch} />
      ))}
    </div>
  )
}

type ChildIssueViewProps = {
  issue: IssueData
  dispatch: (action: ChildIssueActionType) => void
}

const ChildIssueView: React.FC<ChildIssueViewProps> = (props) => {
  const { issue, dispatch } = props
  return (
    <Draggable
      type="moveParent"
      item={issue}
      onDragEnd={(where) => {
        if (where) {
          dispatch(ChildIssueAction.Move(issue, where.id))
        }
      }}
    >
      <ItemView>
        <IssueKey>
          <a href={`/view/${issue.issueKey}`} target="_blank" rel="noreferrer">
            {issue.issueKey}
          </a>
        </IssueKey>
        <Summary>{issue.summary}</Summary>
        <StatusView status={issue.status} variant="tiny" />
      </ItemView>
    </Draggable>
  )
}

const Heading = styled.div({
  fontSize: "0.9em",
  color: "#666"
})

const ItemView = styled(HBox)({
  padding: 2
})

const IssueKey = styled.div({
  display: "inline-block",
  marginRight: 8,
  whiteSpace: "nowrap"
})

const Summary = styled.div({
  flexGrow: 1,
  whiteSpace: "nowrap",
  overflow: "clip"
})
