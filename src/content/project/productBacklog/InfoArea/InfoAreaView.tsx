import styled from "@emotion/styled"
import React from "react"
import { IssueData } from "../../../backlog/Issue"
import { EditableField } from "../../../ui/EditableField"
import { useInfoAreaLogic } from "./InfoAreaLogic"

export type InfoAreaViewProps = {
  issue: IssueData
  markdown?: boolean
}

export const InfoAreaView: React.FC<InfoAreaViewProps> = (props) => {
  const { issue, markdown } = props
  const logic = useInfoAreaLogic(props.issue)

  return (
    <Area>
      <Float>
        <Summary>
          <EditableField
            defaultValue={issue.summary}
            onFix={(value) => logic.changeIssue("summary", value)}
            blurAction="cancel"
            editStyle={{
              flexGrow: 1
            }}
          />
        </Summary>
        <Description>
          <EditableField
            defaultValue={issue.description}
            markdown={markdown}
            multiline={true}
            editStyle={{
              flexGrow: 1
            }}
            viewStyle={{
              flexGrow: 1,
              overflow: "scroll",
              backgroundColor: "#f0f0f0"
            }}
            onFix={(value) => logic.changeIssue("description", value)}
            blurAction="cancel"
          />
        </Description>
      </Float>
    </Area>
  )
}

const Area = styled.div({
  width: "50%"
})

const Float = styled.div({
  padding: 8,
  boxShadow: "-2px 0 3px #c0c0c0",
  height: "calc(100% - 24px)",
  margin: 12,
  display: "flex",
  flexDirection: "column"
})

const Summary = styled.div({
  padding: 4,
  display: "flex"
})

const Description = styled.div({
  padidng: 4,
  flexGrow: 1,
  display: "flex",
  " h1": {
    fontSize: "1.4rem"
  },
  " h2,h3,h4": {
    fontSize: "1.3rem"
  }
})
