import { RealBacklogApi } from "@/content/backlog/BacklogApi"
import { ApiState } from "@/content/state/ApiState"
import { BspEnv, BspEnvState, UserLang } from "@/content/state/BspEnvState"
import { ModalState } from "@/content/state/ModalState"
import { createStore } from "jotai"

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
  const selectedMilestoneId = parseInt(url.searchParams.get("milestone") || "0")
  const projectKey = getProjectKey(url.pathname)
  const lang: UserLang = document.documentElement.lang === "ja" ? "ja" : "en"
  return {
    projectKey,
    lang,
    selectedMilestoneId
  }
}

const jotaiStore = createStore()
jotaiStore.set(ApiState.atom, RealBacklogApi)

export const BspCommon = {
  start,
  buildEnv,
  jotaiStore
} as const
