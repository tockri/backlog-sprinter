// noinspection JSUnusedGlobalSymbols

import { ComponentMeta, ComponentStoryObj } from "@storybook/react"
import React from "react"
import { ItemSelectionState } from "../../../src/content/project/productBacklog/state/ItemSelectionState"
import { ProductBacklogView } from "../../../src/content/project/productBacklog/View"

import { StoryUtil } from "../../StoryUtil"
import { ProjectStoryTemplate, ProjectStoryTemplateProps } from "../ProjectStoryTemplate"

const Template: React.FC<ProjectStoryTemplateProps> = (props) => (
  <ProjectStoryTemplate {...props}>
    <ProductBacklogView />
  </ProjectStoryTemplate>
)

export default { component: Template } as ComponentMeta<typeof Template>

type Story = ComponentStoryObj<typeof Template>

export const Default: Story = {
  args: {
    initialValues: [[ItemSelectionState.atom, { type: "Issue", issueId: 12323242 }]]
  }
}

export const SomeEmptyFields = StoryUtil.produce(Default)((args) => {
  args.initialValues = [[ItemSelectionState.atom, { type: "Issue", issueId: 12323249 }]]
})

export const MilestoneSelected = StoryUtil.produce(Default)((args) => {
  args.initialValues.push([ItemSelectionState.atom, { type: "Milestone", milestoneId: 245742 }])
})

export const MilestoneAdding = StoryUtil.produce(Default)((args) => {
  args.initialValues.push([ItemSelectionState.atom, { type: "MilestoneAdding" }])
})
