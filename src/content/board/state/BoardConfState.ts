import { withImmer } from "jotai-immer"
import { atomWithStorage } from "jotai/utils"

export type BoardConf = {
  sprintDays: number
  moveUnclosed: boolean
  archiveCurrent: boolean
  recordVelocity: boolean
}
const storage = withImmer(
  atomWithStorage<BoardConf>("bsp.BoardConf", {
    sprintDays: 6,
    moveUnclosed: false,
    archiveCurrent: false,
    recordVelocity: false
  })
)

export const BoardConfState = {
  atom: storage
} as const
