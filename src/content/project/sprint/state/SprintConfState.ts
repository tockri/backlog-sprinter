import { BspEnvState } from "../../../state/BspEnvState"
import { JotaiUtil } from "../../../util/JotaiUtil"

export type SprintConf = {
  sprintDays: number
  moveUnclosed: boolean
  archiveCurrent: boolean
  namePrefix: string
  recordVelocity: boolean
}

type Mod = Partial<SprintConf>

const loadFromStorage = (projectKey: string): SprintConf => {
  const key = `bsp.SprintConf.${projectKey}`
  const data = localStorage.getItem(key)
  if (data) {
    return JSON.parse(data) as SprintConf
  } else {
    const initial = {
      sprintDays: 6,
      moveUnclosed: false,
      archiveCurrent: false,
      recordVelocity: false,
      namePrefix: ""
    }
    localStorage.setItem(key, JSON.stringify(initial))
    return initial
  }
}

const saveStorage = (projectKey: string, conf: SprintConf) => {
  const key = `bsp.SprintConf.${projectKey}`
  localStorage.setItem(key, JSON.stringify(conf))
}

const mainAtom = JotaiUtil.atomWithAction(
  (get) => {
    const env = get(BspEnvState.atom)
    return loadFromStorage(env.projectKey)
  },
  (curr, get, set, mod: Mod) => {
    const env = get(BspEnvState.atom)
    const next = { ...curr, ...mod }
    saveStorage(env.projectKey, next)
    return next
  }
)

export const SprintConfState = {
  atom: mainAtom
} as const
