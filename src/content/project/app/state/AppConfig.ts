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

export type AppConfigValue = Immutable<{
  selectedTab: Tabs
  pbiIssueTypeId: number
}>

const InitialAppSetting: AppConfigValue = {
  selectedTab: Tabs.Backlog,
  pbiIssueTypeId: 0
}

const appSettingAtom = withImmer(atomWithStorage<AppConfigValue>("bsp.project.app.setting", InitialAppSetting))

export const AppConfig = {
  atom: appSettingAtom
}
