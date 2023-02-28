// noinspection JSUnusedGlobalSymbols

import { IssueTypeColor } from "@/content/backlog/ProjectInfoApi"
import { AddIssueTypeFormState } from "@/content/project/settings/state/State"
import { ProjectSettings } from "@/content/project/settings/View"
import { ProjectConfState } from "@/content/project/state/ProjectConfState"
import { BspConfState } from "@/content/state/BspConfState"
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
    initialValues: (set) => {
      set(BspConfState.atom, {
        pbiIssueTypeId: 0
      })
      set(ProjectConfState.atom, {
        selectedTab: 0
      })
    }
  }
}

export const Selected: Story = {
  args: {}
}

export const Creating: Story = {
  args: {
    initialValues: (set) => {
      set(ProjectConfState.atom, {
        selectedTab: 0
      })
      set(AddIssueTypeFormState.atom, { creating: true, name: "PBI", color: IssueTypeColor.pill__issue_type_1 })
    }
  }
}
