import styled from "@emotion/styled"
import React from "react"
import { IssueData } from "../../backlog/Issue"
import { cnu } from "../../ui/cnu"

type EstimatedProps = {
  issue: IssueData
  variant?: "view" | "edit"
}

export const Estimated: React.FC<EstimatedProps> = ({ issue, variant }) => {
  if (variant === "edit") {
    return <Edit issue={issue} />
  } else if (issue.estimatedHours) {
    return <View className={estimatedClass(issue.estimatedHours)}>{issue.estimatedHours}</View>
  } else {
    return <></>
  }
}

type EditProps = {
  issue: IssueData
}
const Edit: React.FC<EditProps> = ({ issue }) => {
  return <EditView className={cnu("edit", estimatedClass(issue.estimatedHours))}>{issue.estimatedHours}</EditView>
}

const commonStyles: Parameters<typeof styled.div>[number] = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&.light": {
    backgroundColor: "#A8DA7D",
    color: "white"
  },
  "&.medium": {
    backgroundColor: "#91C4D9",
    color: "white"
  },
  "&.heavy": {
    backgroundColor: "#CE66D9",
    color: "white"
  },
  "&.hell": {
    backgroundColor: "black",
    color: "white"
  }
}

const EditView = styled.div({
  width: 40,
  height: 20,
  borderRadius: 3,
  "&.empty": {
    backgroundColor: "#d0d0d0",
    color: "303030"
  },
  ...commonStyles
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
  } else if (estimatedHour <= 1) {
    return "light"
  } else if (estimatedHour <= 5) {
    return "medium"
  } else if (estimatedHour <= 8) {
    return "heavy"
  } else {
    return "hell"
  }
}
