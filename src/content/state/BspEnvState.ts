import { atom } from "jotai"
import { BspEnv } from "../types"

export const BspEnvState = {
  atom: atom<BspEnv>({
    lang: "en",
    projectKey: ""
  })
} as const
