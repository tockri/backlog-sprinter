import styled from "@emotion/styled"
import React from "react"
import { IssueData } from "../../backlog/Issue"
import { cnu } from "../../ui/cnu"

type EstimatedProps = {
  issue: IssueData
  variant?: "view" | "edit"
  onFix?: (value: number) => void
}

export const Estimated: React.FC<EstimatedProps> = ({ issue, variant, onFix }) => {
  if (variant === "edit") {
    return (
      <EditView
        className={cnu("edit", estimatedClass(issue.estimatedHours))}
        defaultValue={issue.estimatedHours || ""}
        onChange={(e) => {
          const value = e.currentTarget.value
          onFix && onFix(parseInt(value))
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
      </EditView>
    )
  } else if (issue.estimatedHours) {
    return <View className={estimatedClass(issue.estimatedHours)}>{issue.estimatedHours}</View>
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
    backgroundColor: "#9ED5C5",
    color: "white"
  },
  "&.heavy": {
    backgroundColor: "#8EC3B0",
    color: "white"
  },
  "&.hell": {
    backgroundColor: "#333333",
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

const EditView = styled.select({
  appearance: "none",
  borderWidth: 0,
  width: 40,
  height: 30,
  margin: "4px 0",
  borderRadius: 3,
  ...editCommonStyles
})

const EditOption = styled.option({
  textAlign: "center",
  ...editCommonStyles
})

const View = styled.div({
  width: 30,
  height: 30,
  borderRadius: 15,
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
