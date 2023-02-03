import styled from "@emotion/styled"
import { Atom, Provider } from "jotai"
import React from "react"
import { Api } from "../../src/content/project/app/state/Api"
import { AppConfig } from "../../src/content/project/app/state/AppConfig"
import { Environment } from "../../src/content/project/app/state/Environment"
import { Loading } from "../../src/content/ui/Loading"
import { mockApi } from "./mockApi"

export type ProjectStoryTemplateProps = {
  initialValues: Array<[Atom<unknown>, unknown]>
  children: React.ReactNode
}
export const ProjectStoryTemplate: React.FC<ProjectStoryTemplateProps> = ({ initialValues, children }) => {
  return (
    <Provider
      initialValues={[
        [
          AppConfig.atom,
          {
            selectedTab: 0,
            pbiIssueTypeId: 389286
          }
        ],
        [
          Environment.atom,
          {
            projectKey: "BT",
            lang: "ja"
          }
        ],
        [Api.atom, mockApi],
        ...initialValues
      ]}
    >
      <React.Suspense fallback={<Loading />}>
        <Root style={{ height: 480, width: 800, display: "flex" }}>{children}</Root>
      </React.Suspense>
    </Provider>
  )
}

const Root = styled.div({
  " *": {
    fontSize: 13
  }
})
