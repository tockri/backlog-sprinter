import styled from "@emotion/styled"
import React from "react"

const StyledButton = styled.button({
  display: "inline-block",
  boxSizing: "border-box",
  padding: "0 15px",
  borderRadius: 4,
  appearance: "button",
  "&[disabled]": {
    color: "#999999"
  },
  "&:active&:not([disabled])": {
    boxShadow: "inset 1px 1px 2px #aaaaaa"
  }
})

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
  <StyledButton className="button button--primary" {...props} />
)
