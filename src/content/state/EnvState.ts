import { atom } from "jotai"
import { ProjectEnv } from "../types"

export const EnvState = {
  atom: atom<ProjectEnv>({
    lang: "en",
    projectKey: ""
  })
} as const
