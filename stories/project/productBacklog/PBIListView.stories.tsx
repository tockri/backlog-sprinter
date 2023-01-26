import { ComponentMeta, ComponentStoryObj } from "@storybook/react"
import { Atom, Provider } from "jotai"
import React from "react"

import { appSettingAtom, backlogApiAtom, formInfoAtom } from "../../../src/content/project/app/State"

import { PBIListView } from "../../../src/content/project/productBacklog/PBIList/ListView"
import { selectedIssueIdAtom } from "../../../src/content/project/productBacklog/State"
import { Loading } from "../../../src/content/ui/Loading"
import { StoryUtil } from "../../StoryUtil"
import { mockApi } from "./mockApi"

type TemplateProps = {
  initialValues: Array<[Atom<unknown>, unknown]>
}
const Template: React.FC<TemplateProps> = ({ initialValues }) => {
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
        <PBIListView />
      </React.Suspense>
    </Provider>
  )
}

export default { component: Template } as ComponentMeta<typeof Template>

type Story = ComponentStoryObj<typeof Template>

export const Default: Story = {
  args: {
    initialValues: []
  }
}

export const Selected = StoryUtil.produce(Default)((args) => {
  args.initialValues = [[selectedIssueIdAtom, 7177962]]
})
