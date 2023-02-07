import { atom } from "jotai"
import { BacklogApi, RealBacklogApi } from "../../../backlog/BacklogApiForReact"

const backlogApiAtom = atom<BacklogApi>(RealBacklogApi)

export const Api = {
  atom: backlogApiAtom
}
