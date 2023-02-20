import styled from "@emotion/styled"
import React from "react"

type LoadingProps = {
  size?: "small" | "large" | "x-small" | "medium"
}

export const Loading: React.FC<LoadingProps> = (props) => {
  const size = props.size || "medium"
  return (
    <Wrapper>
      <span className={`loading--circle -${size}`}></span>
    </Wrapper>
  )
}

const Wrapper = styled.div({
  textAlign: "center"
})
