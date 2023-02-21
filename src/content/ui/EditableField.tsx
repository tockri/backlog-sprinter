import styled from "@emotion/styled"
import { Immutable } from "immer"
import React, { HTMLInputTypeAttribute } from "react"
import ReactMarkdown from "react-markdown"
import { Tooltip } from "react-tooltip"
import remarkGfm from "remark-gfm"
import { cnu } from "./cnu"
import { TextArea, TextInput } from "./TextInput"

export type EditableFieldProps = Immutable<{
  placeholder?: string
  multiline?: boolean
  markdown?: boolean
  disabled?: boolean
  defaultValue?: string
  blurAction?: "none" | "submit" | "cancel"
  editStyle?: React.CSSProperties
  viewStyle?: React.CSSProperties
  errorMessage?: (value: string) => string | null
  onStart?: (value: string, setValue: (newValue: string) => void) => void
  onFix?: (value: string) => void
  onCancel?: () => void
  defaultEditing?: boolean
  lang?: "ja" | "en"
  inputType?: HTMLInputTypeAttribute
  inputMin?: string
  inputMax?: string
}>

export const EditableField: React.FC<EditableFieldProps> = (props) => {
  const {
    onFix,
    multiline,
    markdown,
    disabled,
    placeholder,
    defaultValue,
    defaultEditing,
    inputType,
    inputMin,
    inputMax,
    lang,
    errorMessage
  } = props
  const [editing, setEditing] = React.useState(defaultEditing)
  const [error, setError] = React.useState<string | null>(null)
  const editor = React.useRef<(HTMLInputElement & HTMLTextAreaElement) | null>(null)

  const onStart = React.useCallback(() => {
    props.onStart &&
      editor.current &&
      props.onStart(editor.current.value, (newValue) => {
        if (editor.current) {
          editor.current.value = newValue
        }
      })
  }, [props])

  const endEdit = () => {
    editor.current = null
    setEditing(false)
  }

  const submit = () => {
    if (editing && !error) {
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
        onStart()
      } else {
        editor.current = null
      }
    }
  }, [editing, defaultValue, onStart])

  const id = React.useRef(`editable-${Math.random()}`)

  const onChange = errorMessage
    ? (e: { target: { value: string } }) => {
        setError(errorMessage(e.target.value))
      }
    : undefined

  return (
    <>
      {editing ? (
        multiline ? (
          <>
            <TextArea
              ref={editor}
              style={props.editStyle}
              placeholder={placeholder}
              disabled={disabled}
              onKeyDown={onKeyDown}
              onBlur={onBlur}
              onChange={onChange}
              id={id.current}
              data-tooltip-content={error ? error : lang === "ja" ? "Ctrl+Enterで確定" : "Press 'Ctrl+Enter' to submit"}
              className={cnu({ error: !!error })}
            />
            <Tooltip place="bottom" anchorId={id.current} />
          </>
        ) : (
          <>
            <TextInput
              type={inputType || "text"}
              min={inputMin}
              max={inputMax}
              ref={editor}
              onKeyDown={onKeyDown}
              onBlur={onBlur}
              style={props.editStyle}
              placeholder={placeholder}
              disabled={disabled}
              id={id.current}
              onChange={onChange}
              data-tooltip-content={error ? error : lang === "ja" ? "Enterで確定" : "Press 'Enter' to submit"}
              className={cnu({ error: !!error })}
            />
            <Tooltip place="bottom" anchorId={id.current} />
          </>
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
    overflow: "auto",
    height: "3em",
    flexGrow: 1
  },
  " p": {
    whiteSpace: "pre-wrap"
  },

  "&.disabled": {
    cursor: "default",
    color: "#909090"
  }
})
