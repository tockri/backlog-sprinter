import styled from "@emotion/styled"

export const Button = styled.button({
  padding: "4px 12px",
  border: "1px solid #a0a0a0",
  backgroundColor: "#eeeeee",
  color: "#666666",
  borderRadius: 4,
  appearance: "button",
  "&[disabled]": {
    backgroundColor: "#cccccc",
    color: "#999999"
  },
  "&:active": {
    boxShadow: "inset 1px 1px 2px #aaaaaa"
  }
})
