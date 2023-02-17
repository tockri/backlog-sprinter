import { atom } from "jotai"
import { BacklogApi, RealBacklogApi } from "../backlog/BacklogApiForReact"

const backlogApiAtom = atom<BacklogApi>(RealBacklogApi)

export const ApiState = {
  atom: backlogApiAtom
}
