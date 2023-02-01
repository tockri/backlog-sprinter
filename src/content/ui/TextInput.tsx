import styled from "@emotion/styled"

const inputStyle: React.CSSProperties = {
  padding: 6,
  borderRadius: 3,
  border: "1px solid #d0d0d0"
}

export const TextInput = styled.input({
  ...inputStyle
})

export const TextArea = styled.textarea({
  ...inputStyle,
  minHeight: "3em"
})
