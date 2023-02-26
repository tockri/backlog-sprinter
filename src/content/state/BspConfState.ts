import { Immutable } from "immer"
import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

export type BspConf = Immutable<{
  pbiIssueTypeId: number
}>

const InitialBspConf: BspConf = { pbiIssueTypeId: 0 }

const storeFamily = atomFamily((projectKey: string) => {
  const sKey = `bsp.BspConf.${projectKey}`
  return atom(
    () => {
      const record = localStorage.getItem(sKey)
      if (record) {
        return JSON.parse(record) as BspConf
      } else {
        return InitialBspConf
      }
    },
    (_get, _set, newValue: BspConf) => {
      localStorage.setItem(sKey, JSON.stringify(newValue))
    }
  )
})

export const BspConfState = {
  atom: storeFamily
} as const
