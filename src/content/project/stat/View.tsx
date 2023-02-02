// noinspection SpellCheckingInspection

import styled from "@emotion/styled"
import React from "react"
import { useModel } from "./Model"

export const StatView: React.FC = () => {
  const model = useModel()
  return (
    <Root>
      {model.statMilestones.map((ms) => (
        <Chart key={ms.id}>
          <img alt="" src={`/burndown/${ms.id}/small`} />
        </Chart>
      ))}
    </Root>
  )
}

const Root = styled.div({
  padding: 12,
  height: "100%",
  overflow: "auto"
})

const Chart = styled.div({
  paddingBottom: 12
})
