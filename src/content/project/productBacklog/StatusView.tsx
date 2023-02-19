import styled from "@emotion/styled"
import { useAtomValue } from "jotai"
import React from "react"
import { Status } from "../../backlog/ProjectInfoApi"
import { StatusesState } from "../../state/ProjectInfoState"

type StatusViewProps = {
  status: Status
  variant?: "view" | "edit" | "tiny"
  onFix?: (statusId: number) => void
}
export const StatusView: React.FC<StatusViewProps> = (props) => {
  const { status, variant } = props
  return (
    <Root>
      {variant === "edit" ? (
        <StatusEditView {...props} />
      ) : variant === "tiny" ? (
        <StatusIcon style={{ backgroundColor: status.color }} />
      ) : (
        <>
          <StatusIcon style={{ backgroundColor: status.color }} />
          {status.name}
        </>
      )}
    </Root>
  )
}

const StatusEditView: React.FC<StatusViewProps> = (props) => {
  const { status, onFix } = props
  const statuses = useAtomValue(StatusesState.atom)
  return (
    <StatusSelect
      style={{ backgroundColor: status.color }}
      value={status.id}
      onChange={(e) => {
        const newValue = parseInt(e.target.value)
        onFix && onFix(newValue)
      }}
    >
      {statuses.map((st) => (
        <option key={st.id} value={st.id} style={{ backgroundColor: st.color }}>
          {st.name}
        </option>
      ))}
    </StatusSelect>
  )
}

const Root = styled.div({
  display: "inline-block",
  marginLeft: "1em"
})

const StatusIcon = styled.div({
  display: "inline-block",
  width: "1em",
  height: "1em",
  borderRadius: "0.5em",
  marginRight: "0.5em",
  position: "relative",
  top: 1
})

const StatusSelect = styled.select({
  appearance: "none",
  cursor: "pointer",
  padding: "0 6px",
  textAlign: "center",
  borderRadius: 12,
  borderWidth: 0,
  color: "white"
})
