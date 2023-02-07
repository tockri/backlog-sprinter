// noinspection JSUnusedGlobalSymbols

import { ComponentMeta, ComponentStoryObj } from "@storybook/react"
import React from "react"
import { IssueTypeColor } from "../../../src/content/backlog/ProjectInfo"
import { AppConfState } from "../../../src/content/project/app/state/AppConfState"
import { issueTypeCreateAtom } from "../../../src/content/project/settings/state/State"
import { ProjectSettings } from "../../../src/content/project/settings/View"
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
        AppConfState.atom,
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
        AppConfState.atom,
        {
          selectedTab: 0,
          pbiIssueTypeId: 0
        }
      ],
      [issueTypeCreateAtom, { creating: true, name: "PBI", color: IssueTypeColor.pill__issue_type_1 }]
    ]
  }
}
