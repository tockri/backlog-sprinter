import styled from "@emotion/styled"
import React from "react"
import { HBox, VBox } from "../../../ui/Box"
import { EditableField } from "../../../ui/EditableField"
import { StatusView } from "../StatusView"
import { StoryPointView } from "../StoryPointView"
import { useInfoAreaModel } from "./Model"

export const InfoAreaView: React.FC = () => {
  const model = useInfoAreaModel()
  const issue = model.issue
  if (issue) {
    return (
      <Area>
        <Float>
          <Head>
            <VBox>
              <HBox>
                <IssueKey>
                  <a href={`/view/${issue.issueKey}`} target="_blank" rel="noreferrer">
                    {issue.issueKey}
                  </a>
                </IssueKey>
                <div>
                  <StatusView
                    status={issue.status}
                    variant="edit"
                    onFix={(value) => model.changeIssue("statusId", value)}
                  />
                </div>
              </HBox>
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
            </VBox>
            <HeadSide>
              <StoryPointView
                estimatedHours={issue.estimatedHours}
                actualHours={issue.actualHours}
                status={issue.status}
                variant="edit"
                onEstimateFix={(value) => model.changeIssue("estimatedHours", value)}
                onActualFix={(value) => model.changeIssue("actualHours", value)}
              />
            </HeadSide>
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
  width: "50%"
})

const Float = styled(VBox)({
  padding: 8,
  boxShadow: "-2px 0 3px #c0c0c0",
  height: "calc(100% - 12px)",
  margin: 12
})

const Head = styled(HBox)({
  flexGrow: 0
})

const IssueKey = styled.div({
  display: "inline-block",
  marginRight: 8,
  whiteSpace: "nowrap"
})

const Summary = styled(VBox)({
  padding: 4
})

const HeadSide = styled(VBox)({
  flexGrow: 0,
  alignItems: "center",
  justifyContent: "center"
})

const Description = styled(HBox)({
  " h1": {
    fontSize: "1.4rem"
  },
  " h2,h3,h4": {
    fontSize: "1.3rem"
  }
})
