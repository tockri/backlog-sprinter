import { Immutable } from "immer"
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
  velocityWikiId: number
}>

const InitialAppConf: AppConf = {
  selectedTab: Tabs.Backlog,
  pbiIssueTypeId: 0,
  velocityWikiId: 0
}

const store = atomWithStorage<AppConf>("bsp.project.app.setting", InitialAppConf)

export const AppConfState = {
  atom: store
}
