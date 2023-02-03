// noinspection JSUnusedGlobalSymbols

import { ComponentMeta, ComponentStoryObj } from "@storybook/react"
import React from "react"
import { InfoAreaView } from "../../../src/content/project/productBacklog/InfoArea/View"

import { SelectedItem } from "../../../src/content/project/productBacklog/state/SelectedItem"
import { StoryUtil } from "../../StoryUtil"
import { ProjectStoryTemplate, ProjectStoryTemplateProps } from "../ProjectStoryTemplate"

const Template: React.FC<ProjectStoryTemplateProps> = (props) => (
  <ProjectStoryTemplate {...props}>
    <InfoAreaView />
  </ProjectStoryTemplate>
)

export default { component: Template } as ComponentMeta<typeof Template>

type Story = ComponentStoryObj<typeof Template>

export const Default: Story = {
  args: {
    initialValues: [[SelectedItem.atom, { type: "Issue", issueId: 12323242 }]]
  }
}

export const SomeEmptyFields = StoryUtil.produce(Default)((args) => {
  args.initialValues = [[SelectedItem.atom, { type: "Issue", issueId: 12323249 }]]
})
