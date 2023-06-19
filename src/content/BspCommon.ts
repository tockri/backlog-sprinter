import { createStore } from "jotai"
import { RealBacklogApi } from "./backlog/BacklogApi"
import { ApiState } from "./state/ApiState"
import { BspEnv, BspEnvState, UserLang } from "./state/BspEnvState"
import { ModalState } from "./state/ModalState"

const start = (env?: BspEnv) => {
  jotaiStore.set(BspEnvState.atom, env || buildEnv())
  jotaiStore.set(ModalState.atom, true)
}

const getProjectKey = (path: string): string => {
  const elem = path.split("/")[2]
  if (elem) {
    const m = elem.match(/^([A-Z_]+)(-\d+)?$/)
    if (m) {
      return m[1]
    }
  }
  return ""
}

const buildEnv = (): BspEnv => {
  const url = new URL(location.href)
  const projectKey = getProjectKey(url.pathname)
  const lang: UserLang = document.documentElement.lang === "ja" ? "ja" : "en"
  return {
    projectKey,
    lang
  }
}

const jotaiStore = createStore()
jotaiStore.set(ApiState.atom, RealBacklogApi)

export const BspCommon = {
  start,
  buildEnv,
  jotaiStore
} as const
