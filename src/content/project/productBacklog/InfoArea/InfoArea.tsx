import styled from "@emotion/styled"
import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { IssueData } from "../../../backlog/Issue"

export type InfoAreaProps = {
  issue: IssueData
}

export const InfoArea: React.FC<InfoAreaProps> = (props) => {
  const { issue } = props
  return (
    <Area>
      <Float>
        <Summary>{issue.summary}</Summary>
        <Description>
          <ReactMarkdown remarkPlugins={[remarkGfm]} linkTarget={"_blank"}>
            {issue.description}
          </ReactMarkdown>
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
  margin: 12
})

const Summary = styled.div({
  padding: 4
})

const Description = styled.div({
  padidng: 4
})
