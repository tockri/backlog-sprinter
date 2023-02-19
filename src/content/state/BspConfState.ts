import { Immutable } from "immer"
import { atomFamily, atomWithStorage } from "jotai/utils"

export type BspConf = Immutable<{
  pbiIssueTypeId: number
}>

const InitialBspConf: BspConf = {
  pbiIssueTypeId: 0
}

const storeFamily = atomFamily((projectKey: string) => atomWithStorage(`bsp.BspConf.${projectKey}`, InitialBspConf))

export const BspConfState = {
  atom: storeFamily
} as const
