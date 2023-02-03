import { atom } from "jotai"
import { ProjectEnv } from "../../types"

type Env = ProjectEnv

export const Environment = {
  atom: atom<Env>({
    lang: "en",
    projectKey: ""
  })
}
