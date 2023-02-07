import styled from "@emotion/styled"

export const VBox = styled.div({
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  " *": {
    boxSizing: "border-box"
  }
})

export const HBox = styled.div({
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "row",
  flexGrow: 1,
  " *": {
    boxSizing: "border-box"
  }
})
