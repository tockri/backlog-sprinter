import { Immutable } from "immer"
import { atomWithStorage } from "jotai/utils"

export type BspConf = Immutable<{
  pbiIssueTypeId: number
}>

const InitialBspConf: BspConf = {
  pbiIssueTypeId: 0
}

const store = atomWithStorage<BspConf>("bsp.global.conf", InitialBspConf)

export const BspConfState = {
  atom: store
} as const
