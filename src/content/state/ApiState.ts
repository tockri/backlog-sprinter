import { atom } from "jotai"
import { BacklogApi, RealBacklogApi } from "../backlog/BacklogApi"

const backlogApiAtom = atom<BacklogApi>(RealBacklogApi)

export const ApiState = {
  atom: backlogApiAtom
} as const
