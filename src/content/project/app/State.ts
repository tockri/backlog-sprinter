import { Immutable } from "immer"
import { Atom, atom, WritableAtom } from "jotai"
import { atomWithImmer, withImmer } from "jotai-immer"
import { atomWithStorage } from "jotai/utils"
import { BacklogApi, RealBacklogApi } from "../../backlog/BacklogApiForReact"

import { ProjectFormInfo } from "../types"

export enum Tabs {
  Backlog = 0,
  //  Velocity = 1,
  Settings = 1
}

export type AppSetting = Immutable<{
  selectedTab: Tabs
  pbiIssueTypeId: number | null
}>

const InitialAppSetting: AppSetting = {
  selectedTab: Tabs.Backlog,
  pbiIssueTypeId: null
}

export const appSettingAtom = withImmer(atomWithStorage<AppSetting>("bsp.project.app.setting", InitialAppSetting))

export const formInfoAtom = atomWithImmer<ProjectFormInfo>({
  lang: "en",
  projectKey: ""
})

export const backlogApiAtom = atom<BacklogApi>(RealBacklogApi)

const makeDerivedAtom = <T, U>(parentAtom: Atom<Promise<T>>, relation: (t: T) => U): WritableAtom<U, U> => {
  const store = atom<U | null>(null)
  const derived = atom<U, U>(
    (get) => {
      const stored = get(store)
      if (stored) {
        return stored
      } else {
        const parent = get(parentAtom)
        return relation(parent)
      }
    },
    (get, set, value) => {
      set(store, value)
    }
  )
  return derived
}

const projectInfoAtom = atom(async (get) => {
  const formInfo = get(formInfoAtom)
  const api = get(backlogApiAtom)
  return await api.projectInfo.getProjectInfoWithCustomFields(formInfo.projectKey)
})

export const projectAtom = makeDerivedAtom(projectInfoAtom, (pi) => pi.project)
export const issueTypesAtom = makeDerivedAtom(projectInfoAtom, (pi) => pi.issueTypes)
export const customFieldsAtom = makeDerivedAtom(projectInfoAtom, (pi) => pi.customFields)
export const statusesAtom = makeDerivedAtom(projectInfoAtom, (pi) => pi.statuses)
