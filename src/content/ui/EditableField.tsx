import styled from "@emotion/styled"
import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cnu } from "./cnu"
import { TextArea, TextInput } from "./TextInput"

export type EditableFieldProps = {
  readonly placeholder?: string
  readonly multiline?: boolean
  readonly markdown?: boolean
  readonly disabled?: boolean
  readonly defaultValue?: string
  readonly blurAction?: "none" | "submit" | "cancel"
  readonly editStyle?: React.CSSProperties
  readonly viewStyle?: React.CSSProperties
  readonly onFix?: (value: string) => void
  readonly onCancel?: () => void
  readonly defaultEditing?: boolean
  readonly inputType?: string
}

export const EditableField: React.FC<EditableFieldProps> = (props) => {
  const { onFix, multiline, markdown, disabled, placeholder, defaultValue, defaultEditing, inputType } = props
  const [editing, setEditing] = React.useState(defaultEditing)
  const editor = React.useRef<(HTMLInputElement & HTMLTextAreaElement) | null>(null)
  const endEdit = () => {
    editor.current = null
    setEditing(false)
  }

  const submit = () => {
    if (editing) {
      onFix && onFix(editor.current?.value || "")
      endEdit()
    }
  }

  const onFocus: React.FocusEventHandler<HTMLElement> = (e) => {
    if (!disabled) {
      const targetElem = e.target as HTMLElement
      if (targetElem.tagName !== "A") {
        setEditing((e) => !e)
      }
    }
  }

  const onBlur: React.FocusEventHandler<HTMLTextAreaElement | HTMLInputElement> = () => {
    switch (props.blurAction) {
      case "submit":
        submit()
        break
      case "cancel":
        endEdit()
        break
    }
  }

  type KeyEvent = React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  const onKeyDown = (e: KeyEvent) => {
    if (!isComposing(e)) {
      if ((e.ctrlKey || e.metaKey || !multiline) && e.key === "Enter") {
        submit()
      } else if (e.key === "Escape") {
        if (editor.current) {
          editor.current.value = props.defaultValue || ""
        }
        endEdit()
        props.onCancel && props.onCancel()
      }
    }
  }
  React.useEffect(() => {
    if (editor.current) {
      if (editing) {
        if (defaultValue !== undefined) {
          editor.current.value = defaultValue
        }
        editor.current.focus()
      } else {
        editor.current = null
      }
    }
  }, [editing, defaultValue])

  return (
    <>
      {editing ? (
        multiline ? (
          <TextArea
            ref={editor}
            style={props.editStyle}
            placeholder={placeholder}
            disabled={disabled}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
          />
        ) : (
          <TextInput
            type={inputType || "text"}
            ref={editor}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            style={props.editStyle}
            placeholder={placeholder}
            disabled={disabled}
          />
        )
      ) : (
        <Viewer tabIndex={0} className={cnu({ disabled, multiline })} style={props.viewStyle} onFocus={onFocus}>
          {defaultValue ? (
            markdown ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]} linkTarget={"_blank"}>
                {defaultValue}
              </ReactMarkdown>
            ) : (
              <>{defaultValue}</>
            )
          ) : (
            <Placeholder>{placeholder || ""}</Placeholder>
          )}
        </Viewer>
      )}
    </>
  )
}

// 2023-01-25 "keyCode" is deprecated
// but since "isComposing" is not exist on Mac chrome,
// (keyCode === 229) is the only way to know composing status.
// noinspection JSDeprecatedSymbols
const isComposing = (e: React.KeyboardEvent): boolean =>
  (e as React.KeyboardEvent & { isComposing: boolean }).isComposing || e.keyCode === 229 || false

const Placeholder = styled.div({
  color: "#c0c0c0"
})

const Viewer = styled.div({
  cursor: "pointer",
  color: "#606060",
  "&.multiline": {
    whiteSpace: "pre-wrap",
    overflow: "auto",
    height: "3em",
    flexGrow: 1
  },

  "&.disabled": {
    cursor: "default",
    color: "#909090"
  }
})
