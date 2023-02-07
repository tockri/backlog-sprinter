import { atom } from "jotai"
import { ProjectEnv } from "../../types"

type Env = ProjectEnv

export const EnvState = {
  atom: atom<Env>({
    lang: "en",
    projectKey: ""
  })
}
