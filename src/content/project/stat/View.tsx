import styled from "@emotion/styled"
import React from "react"
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"
import { useStatModel, VelocityChartData } from "./Model"

export const StatView: React.FC = () => {
  const model = useStatModel()
  return (
    <Root>
      <VelocityChart data={model.chartData} />
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
  overflow: "auto",
  display: "flex",
  flexFlow: "row wrap"
})

const Chart = styled.div({
  paddingBottom: 12
})

export const VelocityChart: React.FC<{ data: VelocityChartData }> = ({ data }) => {
  return (
    <ChartBox>
      <ChartTitle>Velocity</ChartTitle>
      <LineChart
        width={445}
        height={200}
        data={data}
        margin={{
          top: 15,
          right: -10,
          left: -20,
          bottom: 0
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" label={{ value: "PBI", position: "insideTopRight", offset: 0 }} padding={{ top: 20 }} />
        <YAxis
          yAxisId="right"
          label={{ value: "Others", position: "insideTopLeft", offset: 0 }}
          padding={{ top: 20 }}
          orientation="right"
        />
        <Tooltip />
        <Legend align="right" />
        <Line yAxisId="left" type="monotone" dataKey="PBI" stroke="#8884d8" />
        <Line yAxisId="right" type="monotone" dataKey="Others" stroke="#82ca9d" />
      </LineChart>
    </ChartBox>
  )
}

const ChartBox = styled.div({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: 445,
  height: 220
})

const ChartTitle = styled.div({
  fontSize: "0.9em",
  height: 20
})
