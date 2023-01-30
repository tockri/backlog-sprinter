import { useAtom } from "jotai"
import React from "react"
import { IssueData } from "../../../backlog/Issue"
import { Draggable } from "../../../ui/DragAndDrop"
import { ChildIssueAction, ChildIssueActionType, childIssueAtom } from "../State"

type ChildIssueListViewProps = {
  parentIssueId: number
}

export const ChildIssueListView: React.FC<ChildIssueListViewProps> = (props) => {
  const { parentIssueId } = props
  const [children, dispatch] = useAtom(childIssueAtom(parentIssueId))
  return (
    <div>
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
      <div>{issue.summary}</div>
    </Draggable>
  )
}
