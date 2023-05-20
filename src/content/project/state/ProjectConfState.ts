import { Immutable } from "immer"
import { atomWithStorage } from "jotai/utils"

// noinspection JSUnusedGlobalSymbols
export enum Tabs {
  Backlog = 0,
  //  Velocity = 1,
  Stat = 1,
  Settings = 2
}

export type ProjectConf = Immutable<{
  selectedTab: Tabs
}>

const InitialAppConf: ProjectConf = {
  selectedTab: Tabs.Backlog
}

const store = atomWithStorage<ProjectConf>("bsp.ProjectConf", InitialAppConf)

export const ProjectConfState = {
  atom: store
} as const
