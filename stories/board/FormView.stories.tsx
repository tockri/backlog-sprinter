import { FormView } from "@/content/board/FormView"
import { BoardEnvState } from "@/content/board/state/BoardEnvState"
import { ComponentMeta, ComponentStoryObj } from "@storybook/react"
import { MockEnv } from "@test/mock/MockEnv"
import React from "react"
import { BoardStoryTemplate, BoardStoryTemplateProps } from "./BoardStoryTemplate"

const Template: React.FC<BoardStoryTemplateProps> = (props) => (
  <BoardStoryTemplate {...props}>
    <FormView
      onSuccess={(sv) => {
        console.log(sv)
      }}
    />
  </BoardStoryTemplate>
)

export default { component: Template } as ComponentMeta<typeof Template>

type Story = ComponentStoryObj<typeof Template>

export const Default: Story = {
  args: {}
}

export const Selected: Story = {
  args: {
    initialValues: (set) => {
      set(BoardEnvState.atom, {
        ...MockEnv,
        selectedMilestoneId: 245742
      })
    }
  }
}
