import { Immutable } from "immer"
import { withImmer } from "jotai-immer"
import { atomWithStorage } from "jotai/utils"

// noinspection JSUnusedGlobalSymbols
export enum Tabs {
  Backlog = 0,
  //  Velocity = 1,
  Stat = 1,
  Settings = 2
}

export type AppConf = Immutable<{
  selectedTab: Tabs
  pbiIssueTypeId: number
}>

const InitialAppConf: AppConf = {
  selectedTab: Tabs.Backlog,
  pbiIssueTypeId: 0
}

const store = withImmer(atomWithStorage<AppConf>("bsp.project.app.setting", InitialAppConf))

export const AppConfState = {
  atom: store
}
