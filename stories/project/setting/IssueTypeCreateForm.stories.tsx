import { ComponentMeta, ComponentStoryObj } from "@storybook/react"
import React from "react"
import { IssueTypeColor } from "../../../src/content/backlog/ProjectInfo"
import { IssueTypeCreateForm } from "../../../src/content/project/settings/IssueTypeCreateForm"
import { issueTypeCreateAtom } from "../../../src/content/project/settings/State"
import { ProjectStoryTemplate, ProjectStoryTemplateProps } from "../ProjectStoryTemplate"

const Template: React.FC<ProjectStoryTemplateProps> = (props) => (
  <ProjectStoryTemplate {...props}>
    <IssueTypeCreateForm />
  </ProjectStoryTemplate>
)

export default { component: Template } as ComponentMeta<typeof Template>

type Story = ComponentStoryObj<typeof Template>

export const Default: Story = {
  args: {
    initialValues: [[issueTypeCreateAtom, { name: "", color: IssueTypeColor.Scarlet }]]
  }
}
