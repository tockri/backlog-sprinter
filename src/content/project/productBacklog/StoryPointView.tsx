import styled from "@emotion/styled"
import { useAtomValue } from "jotai"
import React from "react"
import { Tooltip } from "react-tooltip"
import "react-tooltip/dist/react-tooltip.min.css"
import { Issue } from "../../backlog/IssueApi"
import { BspEnvState } from "../../state/BspEnvState"
import { HBox } from "../../ui/Box"
import { cnu } from "../../ui/cnu"

import { i18n } from "./i18n"

type StoryPointViewProps = {
  issue: Issue
  variant?: "view" | "edit"
  onEstimateFix?: (value: number) => void
  onActualFix?: (value: number) => void
}

export const StoryPointView: React.FC<StoryPointViewProps> = (props) => {
  return props.variant === "edit" ? <Editor {...props} /> : <Viewer {...props} />
}

const Editor: React.FC<StoryPointViewProps> = (props) => {
  const { issue, onEstimateFix, onActualFix } = props
  const env = useAtomValue(BspEnvState.atom)
  const t = i18n(env.lang)
  const { actualHours, estimatedHours, status } = issue
  return (
    <HBox>
      <HoursSelector id={`est-${issue.id}`} hours={estimatedHours} onFix={onEstimateFix} toolTip={t.estimatedHours} />
      {status.id === 4 && (
        <>
          <HBox style={{ alignItems: "center" }}>→</HBox>
          <HoursSelector id={`act-${issue.id}`} hours={actualHours} onFix={onActualFix} toolTip={t.actualHours} />
        </>
      )}
    </HBox>
  )
}

type HoursSelectorProps = {
  id: string
  hours: number | null
  onFix?: (value: number) => void
  toolTip: string
}

const HoursSelector: React.FC<HoursSelectorProps> = (props) => {
  const { id, hours, onFix, toolTip } = props
  return (
    <>
      <SelectView
        className={cnu("edit", estimatedClass(hours))}
        value={hours || ""}
        onChange={(e) => {
          const newValue = parseInt(e.currentTarget.value)
          // setValue(newValue)
          onFix && onFix(newValue)
        }}
        id={id}
        data-tooltip-content={toolTip}
      >
        <EditOption value="" className="empty"></EditOption>
        <EditOption value="1" className="light">
          1
        </EditOption>
        <EditOption value="2" className="light">
          2
        </EditOption>
        <EditOption value="3" className="medium">
          3
        </EditOption>
        <EditOption value="5" className="medium">
          5
        </EditOption>
        <EditOption value="8" className="heavy">
          8
        </EditOption>
        <EditOption value="13" className="hell">
          13
        </EditOption>
      </SelectView>
      <Tooltip place="bottom" anchorId={id} />
    </>
  )
}

const Viewer: React.FC<StoryPointViewProps> = (props) => {
  const { issue } = props
  const { actualHours, estimatedHours } = issue
  if (estimatedHours && actualHours) {
    return (
      <Overlapping>
        <ViewerPane className={cnu(estimatedClass(estimatedHours), "below")}>{estimatedHours}</ViewerPane>
        <ViewerPane className={cnu(estimatedClass(actualHours), "above")}>{actualHours}</ViewerPane>
      </Overlapping>
    )
  } else if (estimatedHours || actualHours) {
    const hours = estimatedHours || actualHours
    return <ViewerPane className={estimatedClass(hours)}>{hours}</ViewerPane>
  } else {
    return <></>
  }
}

const commonStyles: Parameters<typeof styled.div>[number] = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&.light": {
    backgroundColor: "#BCEAD5",
    color: "white"
  },
  "&.medium": {
    backgroundColor: "#8EC5B5",
    color: "white"
  },
  "&.heavy": {
    backgroundColor: "#6E9380",
    color: "white"
  },
  "&.hell": {
    backgroundColor: "#555555",
    color: "white"
  }
}

const editCommonStyles: Parameters<typeof styled.div>[number] = {
  ...commonStyles,
  "&.empty": {
    backgroundColor: "#c0c0c0",
    color: "303030"
  }
}

const SelectView = styled.select({
  appearance: "none",
  cursor: "pointer",
  flexGrow: 1,
  borderWidth: 0,
  width: 30,
  marginBottom: 4,
  borderRadius: 3,
  ...editCommonStyles
})

const EditOption = styled.option({
  textAlign: "center",
  ...editCommonStyles
})

const Overlapping = styled.div({
  width: 38,
  height: 30,
  position: "relative"
})

const ViewerPane = styled.div({
  width: 30,
  height: 30,
  borderRadius: 15,
  "&.below": {
    position: "absolute",
    zIndex: 1
  },
  "&.above": {
    position: "absolute",
    width: 20,
    height: 20,
    left: 18,
    top: 14,
    zIndex: 2,
    opacity: 0.8,
    fontSize: "80%"
  },
  ...commonStyles
})

const estimatedClass = (estimatedHour: number | null): string => {
  if (!estimatedHour) {
    return "empty"
  } else if (estimatedHour <= 2) {
    return "light"
  } else if (estimatedHour <= 5) {
    return "medium"
  } else if (estimatedHour <= 8) {
    return "heavy"
  } else {
    return "hell"
  }
}
