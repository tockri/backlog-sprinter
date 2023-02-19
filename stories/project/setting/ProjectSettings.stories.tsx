// noinspection JSUnusedGlobalSymbols

import { IssueTypeColor } from "@/content/backlog/ProjectInfoApi"
import { ProjectConfState } from "@/content/project/app/state/ProjectConfState"
import { AddIssueTypeFormState } from "@/content/project/settings/state/State"
import { ProjectSettings } from "@/content/project/settings/View"
import { ComponentMeta, ComponentStoryObj } from "@storybook/react"
import React from "react"
import { ProjectStoryTemplate, ProjectStoryTemplateProps } from "../ProjectStoryTemplate"

const Template: React.FC<ProjectStoryTemplateProps> = (props) => (
  <ProjectStoryTemplate {...props}>
    <ProjectSettings />
  </ProjectStoryTemplate>
)

export default { component: Template } as ComponentMeta<typeof Template>

type Story = ComponentStoryObj<typeof Template>

export const Default: Story = {
  args: {
    initialValues: [
      [
        ProjectConfState.atom,
        {
          selectedTab: 0,
          pbiIssueTypeId: 0
        }
      ]
    ]
  }
}

export const Selected: Story = {
  args: {
    initialValues: []
  }
}

export const Creating: Story = {
  args: {
    initialValues: [
      [
        ProjectConfState.atom,
        {
          selectedTab: 0,
          pbiIssueTypeId: 0
        }
      ],
      [AddIssueTypeFormState.atom, { creating: true, name: "PBI", color: IssueTypeColor.pill__issue_type_1 }]
    ]
  }
}
