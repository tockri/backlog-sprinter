import { ComponentMeta, ComponentStoryObj } from "@storybook/react"
import React from "react"
import { InfoAreaView } from "../../../src/content/project/productBacklog/InfoArea/View"
import { selectedIssueIdAtom } from "../../../src/content/project/productBacklog/State"
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
    initialValues: [[selectedIssueIdAtom, 12323242]]
  }
}

export const SomeEmptyFields = StoryUtil.produce(Default)((args) => {
  args.initialValues = [[selectedIssueIdAtom, 12323249]]
})
