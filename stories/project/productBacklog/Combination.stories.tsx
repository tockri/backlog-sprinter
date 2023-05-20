// noinspection JSUnusedGlobalSymbols

import { ItemSelectionState } from "@/content/project/productBacklog/state/ItemSelectionState"
import { ProductBacklogView } from "@/content/project/productBacklog/View"
import { ComponentMeta, ComponentStoryObj } from "@storybook/react"
import React from "react"

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
    initialValues: (set) => {
      set(ItemSelectionState.atom, { type: "Issue", issueId: 12323242 })
    }
  }
}

export const SomeEmptyFields: Story = {
  args: {
    initialValues: (set) => {
      set(ItemSelectionState.atom, { type: "Issue", issueId: 12323249 })
    }
  }
}

export const MilestoneSelected: Story = {
  args: {
    initialValues: (set) => {
      set(ItemSelectionState.atom, { type: "Milestone", milestoneId: 245742 })
    }
  }
}

export const MilestoneAdding: Story = {
  args: {
    initialValues: (set) => {
      set(ItemSelectionState.atom, { type: "MilestoneAdding" })
    }
  }
}
