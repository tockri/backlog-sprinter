import styled from "@emotion/styled"
import { useAtomValue } from "jotai"
import React from "react"
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"
import { BspEnvState } from "../../state/BspEnvState"
import { i18n } from "../i18n"
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

type GraphLabels = {
  pbi: string
  others: string
  mva3: string
}

const buildData = (data: VelocityChartData, key: "PBI" | "Others", labels: GraphLabels) =>
  data.map((record, i) => {
    const mva =
      i === 0
        ? record[key]
        : i === 1
        ? (data[0][key] + data[1][key]) / 2.0
        : (data[i - 2][key] + data[i - 1][key] + record[key]) / 3.0
    return {
      name: record.name,
      [key === "PBI" ? labels.pbi : labels.others]: record[key],
      [labels.mva3]: mva
    }
  })

export const VelocityChart: React.FC<{ data: VelocityChartData }> = ({ data }) => {
  const env = useAtomValue(BspEnvState.atom)
  const t = i18n(env.lang)
  return (
    <>
      <ChartBox>
        <ChartTitle>{t.pbiVelocity}</ChartTitle>
        <LineChart
          width={445}
          height={200}
          data={buildData(data, "PBI", t.graphLabels)}
          margin={{
            top: 15,
            right: 20,
            left: -20,
            bottom: 10
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" height={20} />
          <YAxis />
          <Tooltip
            formatter={(value) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(+value)}
          />
          <Legend align="right" />
          <Line type="monotone" dataKey={t.graphLabels.pbi} stroke="#f8c4c0" strokeDasharray="4 2" />
          <Line type="monotone" dataKey={t.graphLabels.mva3} stroke="#d88488" />
        </LineChart>
      </ChartBox>
      <ChartBox>
        <ChartTitle>{t.othersVelocity}</ChartTitle>
        <LineChart
          width={445}
          height={200}
          data={buildData(data, "Others", t.graphLabels)}
          margin={{
            top: 15,
            right: 20,
            left: -20,
            bottom: 10
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" height={20} />
          <YAxis />
          <Tooltip
            formatter={(value) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(+value)}
          />
          <Legend align="right" height={0} margin={{ bottom: 10 }} />
          <Line type="monotone" dataKey={t.graphLabels.others} stroke="#c2cafd" strokeDasharray="4 2" />
          <Line type="monotone" dataKey={t.graphLabels.mva3} stroke="#8288ed" />
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
