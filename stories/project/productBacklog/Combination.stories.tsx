// noinspection JSUnusedGlobalSymbols

import { ComponentMeta, ComponentStoryObj } from "@storybook/react"
import React from "react"
import { milestoneFormAtom } from "../../../src/content/project/productBacklog/PBIList/State"
import { selectedIssueIdAtom } from "../../../src/content/project/productBacklog/State"
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
    initialValues: [[selectedIssueIdAtom, 12323242]]
  }
}

export const SomeEmptyFields = StoryUtil.produce(Default)((args) => {
  args.initialValues = [[selectedIssueIdAtom, 12323249]]
})

export const CreatingMilestone = StoryUtil.produce(Default)((args) => {
  args.initialValues.push([
    milestoneFormAtom,
    {
      creating: true,
      name: "",
      startDate: null,
      endDate: null
    }
  ])
})
