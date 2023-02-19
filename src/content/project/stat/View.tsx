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

const buildData = (data: VelocityChartData, key: "PBI" | "Others") =>
  data.map((record, i) => {
    const mva =
      i === 0
        ? record[key]
        : i === 1
        ? (data[0][key] + data[1][key]) / 2.0
        : (data[i - 2][key] + data[i - 1][key] + record[key]) / 3.0
    return {
      name: record.name,
      [key]: record[key],
      "3-week Moving Average": mva
    }
  })

export const VelocityChart: React.FC<{ data: VelocityChartData }> = ({ data }) => {
  return (
    <>
      <ChartBox>
        <ChartTitle>PBI Velocity</ChartTitle>
        <LineChart
          width={445}
          height={200}
          data={buildData(data, "PBI")}
          margin={{
            top: 15,
            right: -10,
            left: -20,
            bottom: 10
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" height={20} />
          <YAxis />
          <Tooltip />
          <Legend align="right" />
          <Line type="monotone" dataKey="PBI" stroke="#f8c4c0" strokeDasharray="4 2" />
          <Line type="monotone" dataKey="3-week Moving Average" stroke="#d88488" />
        </LineChart>
      </ChartBox>
      <ChartBox>
        <ChartTitle>Others Velocity</ChartTitle>
        <LineChart
          width={445}
          height={200}
          data={buildData(data, "Others")}
          margin={{
            top: 15,
            right: -10,
            left: -20,
            bottom: 10
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" height={20} />
          <YAxis />
          <Tooltip />
          <Legend align="right" height={0} margin={{ bottom: 10 }} />
          <Line type="monotone" dataKey="Others" stroke="#c2cafd" strokeDasharray="4 2" />
          <Line type="monotone" dataKey="3-week Moving Average" stroke="#8288ed" />
        </LineChart>
      </ChartBox>
    </>
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
