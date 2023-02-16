import { atom } from "jotai"
import { BacklogApi, RealBacklogApi } from "../BacklogApiForReact"

const backlogApiAtom = atom<BacklogApi>(RealBacklogApi)

export const Api = {
  atom: backlogApiAtom
}
