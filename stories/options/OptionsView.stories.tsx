import { ApiKeyEntriesState } from "@/options/state/ApiKeyEntriesState"
import { OptionsView } from "@/options/View"
import { ComponentMeta, ComponentStoryObj } from "@storybook/react"
import React from "react"
import { ProjectStoryTemplateProps } from "../project/ProjectStoryTemplate"
import { OptionsStoryTemplate } from "./OptionsStoryTemplate"

const Template: React.FC<ProjectStoryTemplateProps> = (props) => (
  <OptionsStoryTemplate {...props}>
    <OptionsView />
  </OptionsStoryTemplate>
)

export default { component: Template } as ComponentMeta<typeof Template>

type Story = ComponentStoryObj<typeof Template>

export const Default: Story = {
  args: {}
}

export const With2Items: Story = {
  args: {
    initialValues: (set) => {
      set(
        ApiKeyEntriesState.atom,
        ApiKeyEntriesState.TestAction.Replace([
          {
            id: "id-1",
            site: "test-site",
            key: "test-key"
          },
          {
            id: "id-2",
            site: "test-site-2",
            key: "test-key-2"
          }
        ])
      )
    }
  }
}
