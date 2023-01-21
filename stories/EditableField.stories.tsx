import { Story } from "@storybook/react"
import React from "react"
import { EditableField, EditableFieldProps } from "../src/content/ui/EditableField"

const Template =
  (args: EditableFieldProps): Story =>
  () => {
    const [state, setState] = React.useState<EditableFieldProps>(args)
    return (
      <EditableField
        {...state}
        placeholder="input here"
        onFix={(value) => {
          setState((s) => ({
            ...s,
            defaultValue: value
          }))
        }}
        onCancel={() => setState((s) => ({ ...s, editing: false }))}
      />
    )
  }

export const Simple = Template({})

export const Multiline = Template({ multiline: true })

export const DefaultValue = Template({ defaultValue: "default value" })

export const Markdown = Template({
  markdown: true,
  multiline: true,
  viewStyle: {
    height: "8em",
    border: "1px solid gray",
    borderRadius: 3,
    backgroundColor: "#f0f0f0",
    overflow: "auto"
  },
  editStyle: {
    height: "8em",
    width: "100%"
  }
})

export const Styled = Template({
  editStyle: {
    backgroundColor: "#ff0000",
    color: "white"
  }
})

export const SubmitOnBlur = Template({
  blurAction: "submit"
})

export const CancelOnBlur = Template({
  blurAction: "cancel"
})

export default {
  title: "EditableField"
}
