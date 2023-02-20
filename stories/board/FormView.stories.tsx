import { FormView } from "@/content/board/FormView"

import { FormState } from "@/content/board/state/FormState"
import { BspEnvState } from "@/content/state/BspEnvState"
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
      set(BspEnvState.atom, {
        ...MockEnv,
        selectedMilestoneId: 245742
      })
    }
  }
}

export const Submitting: Story = {
  args: {
    initialValues: (set) => {
      set(FormState.atom, { type: "TestSubmitting", message: "BD-123 更新中テスト" }).then()
    }
  }
}

export const SubmittingLong: Story = {
  args: {
    initialValues: (set) => {
      set(FormState.atom, {
        type: "TestSubmitting",
        message:
          "BD-123 とても長いタイトルの課題更新中テストとても長いタイトルの課題更新中テストとても長いタイトルの課題更新中テスト"
      }).then()
    }
  }
}
