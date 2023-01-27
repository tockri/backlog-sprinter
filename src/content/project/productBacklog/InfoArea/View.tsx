import styled from "@emotion/styled"
import React from "react"
import { EditableField } from "../../../ui/EditableField"
import { Estimated } from "../Estimated"
import { useInfoAreaModel } from "./Model"

export const InfoAreaView: React.FC = () => {
  const model = useInfoAreaModel()
  const issue = model.issue
  if (issue) {
    return (
      <Area>
        <Float>
          <Head>
            <Summary>
              <EditableField
                defaultValue={issue.summary}
                onFix={(value) => model.changeIssue("summary", value)}
                blurAction="cancel"
                editStyle={{
                  flexGrow: 1
                }}
              />
            </Summary>
            <SummarySide>
              <Estimated
                estimatedHours={issue.estimatedHours}
                variant="edit"
                onFix={(value) => model.changeIssue("estimatedHours", value)}
              />
            </SummarySide>
          </Head>
          <Description>
            <EditableField
              defaultValue={issue.description}
              markdown={model.markdown}
              multiline={true}
              editStyle={{
                flexGrow: 1
              }}
              viewStyle={{
                flexGrow: 1,
                overflow: "scroll",
                backgroundColor: "#f0f0f0"
              }}
              onFix={(value) => model.changeIssue("description", value)}
              blurAction="cancel"
            />
          </Description>
        </Float>
      </Area>
    )
  } else {
    return <></>
  }
}

const Area = styled.div({
  width: "75%"
})

const Float = styled.div({
  padding: 8,
  boxShadow: "-2px 0 3px #c0c0c0",
  height: "calc(100% - 24px)",
  margin: 12,
  display: "flex",
  flexDirection: "column"
})

const Head = styled.div({
  display: "flex"
})

const Summary = styled.div({
  padding: 4,
  flexGrow: 1,
  display: "flex",
  flexDirection: "column"
})

const SummarySide = styled.div({
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
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
