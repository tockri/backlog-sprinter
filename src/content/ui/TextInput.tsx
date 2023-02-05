import styled from "@emotion/styled"

const inputStyle: Parameters<typeof styled.input | typeof styled.textarea>[number] = {
  padding: 6,
  borderRadius: 3,
  border: "1px solid #d0d0d0",
  "&:invalid,&.error": {
    border: "2px solid #ffcccc"
  }
}

export const TextInput = styled.input({
  ...inputStyle
})

export const TextArea = styled.textarea({
  ...inputStyle,
  minHeight: "3em"
})
