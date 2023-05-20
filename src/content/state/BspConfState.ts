import { BspEnvState } from "@/content/state/BspEnvState"
import { Immutable } from "immer"
import { atom } from "jotai"

export type BspConf = Immutable<{
  pbiIssueTypeId: number
}>

const InitialBspConf: BspConf = { pbiIssueTypeId: 0 }

const store = atom<BspConf | null>(null)

const mainAtom = atom(
  (get) => {
    const env = get(BspEnvState.atom)
    const stored = get(store)
    if (env.projectKey) {
      if (stored) {
        return stored
      } else {
        const sKey = `bsp.BspConf.${env.projectKey}`
        const record = localStorage.getItem(sKey)
        if (record) {
          return JSON.parse(record) as BspConf
        }
      }
    }
    return InitialBspConf
  },
  (get, set, newValue: BspConf) => {
    const env = get(BspEnvState.atom)
    if (env.projectKey) {
      const sKey = `bsp.BspConf.${env.projectKey}`
      localStorage.setItem(sKey, JSON.stringify(newValue))
      set(store, newValue)
    }
  }
)

export const BspConfState = {
  atom: mainAtom
} as const
