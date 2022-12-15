import { PartialViewState } from "./Reducers"

const key = "board.milestoneForm.storage"

const load = (): PartialViewState => {
  const value = localStorage.getItem(key)
  const data: PartialViewState = value
    ? JSON.parse(value)
    : {
        sprintDays: 6,
        moveUnclosed: false,
        archiveCurrent: false
      }
  return extract(data)
}

const save = (data: PartialViewState) => {
  localStorage.setItem(key, JSON.stringify(extract(data)))
}

const merge = <T extends PartialViewState>(state: T, data: PartialViewState): T => ({
  ...state,
  sprintDays: data.sprintDays,
  moveUnclosed: data.moveUnclosed,
  archiveCurrent: data.archiveCurrent
})

const extract = <T extends PartialViewState>(state: T): PartialViewState => ({
  sprintDays: state.sprintDays,
  moveUnclosed: state.moveUnclosed,
  archiveCurrent: state.archiveCurrent
})

export const StorageSystem = {
  load,
  save,
  merge,
  extract
}
