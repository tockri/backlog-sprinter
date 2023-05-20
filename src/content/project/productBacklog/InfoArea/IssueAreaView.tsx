import styled from "@emotion/styled"
import React from "react"
import { HBox, VBox } from "../../../ui/Box"
import { EditableField } from "../../../ui/EditableField"
import { Loading } from "../../../ui/Loading"
import { StatusView } from "../StatusView"
import { StoryPointView } from "../StoryPointView"
import { ChildIssueListView } from "./ChildIssueListView"
import { useIssueAreaModel } from "./IssueAreaModel"

export const IssueAreaView: React.FC = () => {
  const model = useIssueAreaModel()
  const { issue, lang } = model
  if (issue) {
    return (
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
                blurAction="submit"
                editStyle={{
                  flexGrow: 1
                }}
                lang={lang}
              />
            </Summary>
          </VBox>
          <HeadSide>
            <StoryPointView
              issue={issue}
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
              backgroundColor: "#f0f0f0",
              borderRadius: 4
            }}
            onFix={(value) => model.changeIssue("description", value)}
            blurAction="submit"
            lang={lang}
          />
        </Description>
        <React.Suspense fallback={<Loading />}>
          <ChildIssueListView parentIssueId={issue.id} />
        </React.Suspense>
      </Float>
    )
  } else {
    return <></>
  }
}

const Float = styled(VBox)({
  boxSizing: "border-box",
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
  justifyContent: "center",
  height: 36,
  paddingRight: 4
})

const HeadSide = styled(VBox)({
  flexGrow: 0,
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 0"
})

const Description = styled(VBox)({
  " h1": {
    fontSize: "1.4rem"
  },
  " h2,h3,h4": {
    fontSize: "1.3rem"
  }
})
