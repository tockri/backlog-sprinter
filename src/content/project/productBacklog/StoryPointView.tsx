import styled from "@emotion/styled"
import React from "react"
import { Status } from "../../backlog/ProjectInfo"
import { HBox } from "../../ui/Box"
import { cnu } from "../../ui/cnu"

type StoryPointViewProps = {
  estimatedHours: number | null
  actualHours: number | null
  status: Status
  variant?: "view" | "edit"
  onEstimateFix?: (value: number) => void
  onActualFix?: (value: number) => void
}

export const StoryPointView: React.FC<StoryPointViewProps> = (props) => {
  return props.variant === "edit" ? <Editor {...props} /> : <Viewer {...props} />
}

const Editor: React.FC<StoryPointViewProps> = (props) => {
  const { estimatedHours, actualHours, onEstimateFix, onActualFix, status } = props
  return (
    <HBox>
      <HoursSelector hours={estimatedHours} onFix={onEstimateFix} />
      {status.id === 4 && <HoursSelector hours={actualHours} onFix={onActualFix} />}
    </HBox>
  )
}

type HoursSelectorProps = {
  hours: number | null
  onFix?: (value: number) => void
}

const HoursSelector: React.FC<HoursSelectorProps> = (props) => {
  const { hours, onFix } = props
  return (
    <SelectView
      className={cnu("edit", estimatedClass(hours))}
      value={hours || ""}
      onChange={(e) => {
        const newValue = parseInt(e.currentTarget.value)
        // setValue(newValue)
        onFix && onFix(newValue)
      }}
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
  )
}

const Viewer: React.FC<StoryPointViewProps> = (props) => {
  const { estimatedHours, actualHours } = props
  if (estimatedHours && actualHours) {
    return (
      <Overwrapping>
        <ViewerPane className={cnu(estimatedClass(estimatedHours), "below")}>{estimatedHours}</ViewerPane>
        <ViewerPane className={cnu(estimatedClass(actualHours), "above")}>{actualHours}</ViewerPane>
      </Overwrapping>
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

const Overwrapping = styled.div({
  width: 50,
  height: 30,
  position: "relative"
})

const ViewerPane = styled.div({
  width: 30,
  height: 30,
  borderRadius: 15,
  "&.below": {
    position: "absolute",
    width: 26,
    height: 26,
    top: 2,
    zIndex: 1,
    opacity: 0.5
  },
  "&.above": {
    position: "absolute",
    left: 20,
    zIndex: 2
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
