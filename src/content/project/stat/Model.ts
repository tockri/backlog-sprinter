import { Immutable } from "immer"
import { useAtomValue } from "jotai"
import { DateUtil } from "../../../util/DateUtil"
import { Version } from "../../backlog/ProjectInfoApi"
import { MilestonesState } from "../app/state/ProjectInfoState"

type StatModel = Immutable<{
  statMilestones: Version[]
}>

export const useModel = (): StatModel => {
  const milestones = useAtomValue(MilestonesState.atom)
  return {
    statMilestones: filterMilestones(milestones)
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
