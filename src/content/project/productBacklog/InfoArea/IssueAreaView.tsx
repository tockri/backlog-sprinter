import styled from "@emotion/styled"
import { useAtom, useAtomValue } from "jotai/index"
import React from "react"
import { EditIssueInput } from "../../../backlog/IssueApi"
import { BspEnvState } from "../../../state/BspEnvState"
import { ProjectState } from "../../../state/ProjectInfoState"
import { HBox, VBox } from "../../../ui/Box"
import { EditableField } from "../../../ui/EditableField"
import { Loading } from "../../../ui/Loading"
import { ItemSelectionState } from "../state/ItemSelectionState"
import { PBIListFunc } from "../state/PBIList"
import { PBIListState } from "../state/PBIListState"
import { StatusView } from "../StatusView"
import { StoryPointView } from "../StoryPointView"
import { ChildIssueListView } from "./ChildIssueListView"

export const IssueAreaView: React.FC = () => {
  const item = useAtomValue(ItemSelectionState.atom)
  const project = useAtomValue(ProjectState.atom)
  const markdown = project.textFormattingRule === "markdown"
  const [pbiList, dispatch] = useAtom(PBIListState.atom)
  const { lang } = useAtomValue(BspEnvState.atom)
  const issue = item.type === "Issue" ? PBIListFunc.findIssue(pbiList, item.issueId) : null

  if (issue) {
    const fix = (input: EditIssueInput) => dispatch(PBIListState.Action.EditIssue(issue.id, input))
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
                <StatusView status={issue.status} variant="edit" onFix={(value) => fix({ statusId: value })} />
              </div>
            </HBox>
            <Summary>
              <EditableField
                defaultValue={issue.summary}
                onFix={(value) => fix({ summary: value })}
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
              onEstimateFix={(value) => fix({ estimatedHours: value })}
              onActualFix={(value) => fix({ actualHours: value })}
            />
          </HeadSide>
        </Head>
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
              backgroundColor: "#f0f0f0",
              borderRadius: 4
            }}
            onFix={(value) => fix({ description: value })}
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
  },
  " ul,ol": {
    paddingLeft: "2rem"
  }
})
