import { withImmer } from "jotai-immer"
import { atomWithStorage } from "jotai/utils"

export type BoardConf = {
  sprintDays: number
  moveUnclosed: boolean
  archiveCurrent: boolean
}
const storage = withImmer(atomWithStorage("board.conf", { sprintDays: 6, moveUnclosed: false, archiveCurrent: false }))

export const BoardConfState = {
  atom: storage
} as const
