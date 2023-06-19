import { Immutable } from "immer"
import { atom } from "jotai"
import { atomFamily, atomWithStorage } from "jotai/utils"
import { BspEnvState } from "./BspEnvState"

export type BspConf = Immutable<{
  pbiIssueTypeId: number
  hideCompletedPbi?: boolean
}>

const InitialBspConf: BspConf = { pbiIssueTypeId: 0 }

const store = atomFamily((projectKey: string) => atomWithStorage(`bsp.BspConf.${projectKey}`, InitialBspConf))

const mainAtom = atom(
  (get) => {
    const env = get(BspEnvState.atom)
    return get(store(env.projectKey))
  },
  (get, set, newValue: BspConf) => {
    const env = get(BspEnvState.atom)
    set(store(env.projectKey), newValue)
  }
)

export const BspConfState = {
  atom: mainAtom
} as const
