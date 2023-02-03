import styled from "@emotion/styled"
import React from "react"
import { useInfoAreaModel } from "./IssueAreaModel"
import { IssueAreaView } from "./IssueAreaView"

export const InfoAreaView: React.FC = () => {
  const model = useInfoAreaModel()
  const { type } = model
  if (type === "Issue") {
    return (
      <Area>
        <IssueAreaView />
      </Area>
    )
  } else if (type === "Milestone") {
    return <Area>milestone</Area>
  } else {
    return null
  }
}

const Area = styled.div({
  width: "50%",
  height: "calc(100% - 12px)"
})
