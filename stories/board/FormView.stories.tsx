import { Story } from "@ladle/react"
import React from "react"
import { FormView } from "../../src/content/board/FormView"
import { FormState } from "../../src/content/board/state/FormState"
import { BspEnvState } from "../../src/content/state/BspEnvState"
import { MockEnv } from "../../src/test/mock/MockEnv"
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

export const Default = Template

export const Selected: Story = () => (
  <Template
    initialValues={(set) => {
      set(BspEnvState.atom, {
        ...MockEnv,
        selectedMilestoneId: 245742
      })
    }}
  />
)

export const Submitting: Story = () => (
  <Template
    initialValues={(set) => {
      set(FormState.atom, { type: "TestSubmitting", message: "BD-123 更新中テスト" }).then()
    }}
  />
)

export const SubmittingLong: Story = () => (
  <Template
    initialValues={(set) => {
      set(FormState.atom, {
        type: "TestSubmitting",
        message:
          "BD-123 とても長いタイトルの課題更新中テストとても長いタイトルの課題更新中テストとても長いタイトルの課題更新中テスト"
      }).then()
    }}
  />
)
