import { Atom, Provider } from "jotai"
import React from "react"

import { appSettingAtom, backlogApiAtom, formInfoAtom } from "../../src/content/project/app/State"

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
        ...initialValues,
        [
          appSettingAtom,
          {
            selectedTab: 0,
            pbiIssueTypeId: 389286
          }
        ],
        [
          formInfoAtom,
          {
            projectKey: "BT",
            lang: "ja"
          }
        ],
        [backlogApiAtom, mockApi]
      ]}
    >
      <React.Suspense fallback={<Loading />}>
        <div style={{ height: 480, display: "flex" }}>{children}</div>
      </React.Suspense>
    </Provider>
  )
}
