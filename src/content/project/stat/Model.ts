import { useAtomValue } from "jotai"
import { DateUtil } from "../../../util/DateUtil"
import { Version } from "../../backlog/ProjectInfoApi"
import { MilestonesState } from "../../state/ProjectInfoState"
import { VelocityRecords } from "../../state/SprintVelocity"
import { VelocityState } from "../../state/VelocityState"

export type VelocityChartData = { name: string; PBI: number; Others: number }[]

type StatModel = {
  readonly statMilestones: ReadonlyArray<Version>
  readonly chartData: VelocityChartData
}

export const useStatModel = (): StatModel => {
  const milestones = useAtomValue(MilestonesState.atom)
  const wikiVelocity = useAtomValue(VelocityState.atom)
  return {
    statMilestones: filterMilestones(milestones),
    chartData: makeChartData(wikiVelocity.velocity)
  }
}

const filterMilestones = (milestones: ReadonlyArray<Version>): Version[] => {
  const today = DateUtil.beginningOfDay(new Date())
  return milestones
    .filter(
      (ms) =>
        !ms.archived &&
        ms.startDate &&
        ms.releaseDueDate &&
        DateUtil.diffDays(new Date(ms.startDate), today) >= 0 &&
        DateUtil.diffDays(today, new Date(ms.releaseDueDate)) > -3
    )
    .sort((v1, v2) => {
      if (v1.releaseDueDate && v2.releaseDueDate) {
        return Date.parse(v1.releaseDueDate) - Date.parse(v2.releaseDueDate)
      } else {
        return 0
      }
    })
}

const makeChartData = (velocity: VelocityRecords): VelocityChartData => {
  return velocity.map((sv) => ({
    name: DateUtil.shortDateString(sv.endDate),
    PBI: sv.pbiVelocity,
    Others: sv.otherVelocity
  }))
}
