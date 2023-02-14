// noinspection JSUnusedGlobalSymbols

import { PBIListView } from "@/content/project/productBacklog/PBIList/PBIListView"
import { ItemSelectionState } from "@/content/project/productBacklog/state/ItemSelectionState"
import { ComponentMeta, ComponentStoryObj } from "@storybook/react"
import React from "react"
import { StoryUtil } from "../../StoryUtil"
import { ProjectStoryTemplate, ProjectStoryTemplateProps } from "../ProjectStoryTemplate"

const Template: React.FC<ProjectStoryTemplateProps> = (props) => (
  <ProjectStoryTemplate {...props}>
    <PBIListView />
  </ProjectStoryTemplate>
)

export default { component: Template } as ComponentMeta<typeof Template>

type Story = ComponentStoryObj<typeof Template>

export const Default: Story = {
  args: {
    initialValues: [[ItemSelectionState.atom, { type: "Issue", issueId: 7177962 }]]
  }
}

export const Selected = StoryUtil.produce(Default)((args) => {
  args.initialValues = [[ItemSelectionState.atom, { type: "Issue", issueId: 7177962 }]]
})
