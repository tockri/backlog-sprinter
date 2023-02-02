// noinspection JSUnusedGlobalSymbols

import { ComponentMeta, ComponentStoryObj } from "@storybook/react"

import styled from "@emotion/styled"
import React from "react"
import { EditableField, EditableFieldProps } from "../../src/content/ui/EditableField"
import { StoryUtil } from "../StoryUtil"

const Template: React.FC<EditableFieldProps> = (props) => {
  const { onFix, defaultValue, ...compProps } = props
  const [value, setDefaultValue] = React.useState(defaultValue)

  return (
    <TemplatePane>
      <EditableField
        {...compProps}
        defaultValue={value}
        onFix={(value) => {
          setDefaultValue(value)
          onFix && onFix(value)
        }}
      />
      <div id="message">Message here</div>
    </TemplatePane>
  )
}

const TemplatePane = styled.div({
  border: "1px solid lightgray",
  borderRadius: 4,
  padding: 16
})

export default { component: Template } as ComponentMeta<typeof Template>

type Story = ComponentStoryObj<typeof Template>

export const Default: Story = {
  args: {
    defaultValue: "Here is a editable input",
    blurAction: "none",
    onFix: (value) => {
      console.log("Fix", value)
    },
    viewStyle: {
      display: "block",
      padding: 8,
      backgroundColor: "#f0f0f0"
    },
    editStyle: {
      width: "100%",
      boxSizing: "border-box",
      padding: 8,
      backgroundColor: "#eeffee"
    }
  }
}

export const Multiline = StoryUtil.produce(Default)((args) => {
  args.multiline = true
  args.defaultValue = "multiline\nediting\ntext"
  if (args.editStyle) {
    args.editStyle.height = "5em"
    args.editStyle.fontSize = 16
  }
})

export const Editing = StoryUtil.produce(Default)((args) => {
  args.defaultEditing = true
})

export const MultilineEditing = StoryUtil.produce(Multiline)((args) => {
  args.defaultEditing = true
})
