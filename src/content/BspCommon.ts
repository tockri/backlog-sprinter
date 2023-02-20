import { RealBacklogApi } from "@/content/backlog/BacklogApiForReact"
import { ApiState } from "@/content/state/ApiState"
import { BspEnv, BspEnvState, UserLang } from "@/content/state/BspEnvState"
import { createStore } from "jotai/index"

const start = (env?: BspEnv) => {
  jotaiStore.set(BspEnvState.atom, env || buildEnv())
}

const buildEnv = (): BspEnv => {
  const url = new URL(location.href)
  const selectedMilestoneId = parseInt(url.searchParams.get("milestone") || "0")
  const projectKey = url.pathname.split("/")[2] || ""
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
