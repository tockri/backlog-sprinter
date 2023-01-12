import styled from "@emotion/styled"
import React from "react"

const Wrapper = styled.div`
  text-align: center;
`

export const Loading: React.FC = () => (
  <Wrapper>
    <span className="loading--circle -small"></span>
  </Wrapper>
)
