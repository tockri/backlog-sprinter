import { ComponentMeta, ComponentStoryObj } from "@storybook/react"
import React from "react"
import { PBIListView } from "../../../src/content/project/productBacklog/PBIList/ListView"
import { selectedIssueIdAtom } from "../../../src/content/project/productBacklog/State"
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
    initialValues: []
  }
}

export const Selected = StoryUtil.produce(Default)((args) => {
  args.initialValues = [[selectedIssueIdAtom, 7177962]]
})
