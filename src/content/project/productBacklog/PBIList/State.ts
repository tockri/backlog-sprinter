import { atom } from "jotai"
import { atomWithImmer } from "jotai-immer"
import { DateUtil } from "../../../../util/DateUtil"
import { ObjectUtil } from "../../../../util/ObjectUtil"
import { projectAtom } from "../../app/State"
import { productBacklogAtom } from "../State"

export type MilestoneCreateForm = {
  creating: boolean
  name: string
  startDate: Date | null
  endDate: Date | null
}
const emptyForm: MilestoneCreateForm = {
  creating: false,
  name: "",
  startDate: null,
  endDate: null
}

enum ActionTypes {
  Start = "Start",
  Create = "Create",
  Cancel = "Cancel",
  SetName = "SetName",
  SetStartDate = "SetStartDate",
  SetEndDate = "SetEndDate",
  Submit = "Submit"
}

type SetNameType = {
  type: ActionTypes.SetName
  name: string
}
const SetName = (name: string): SetNameType => ({
  type: ActionTypes.SetName,
  name
})

type SetStartDateType = {
  type: ActionTypes.SetStartDate
  date: Date | null
}
const SetStartDate = (dateString: string): SetStartDateType => ({
  type: ActionTypes.SetStartDate,
  date: DateUtil.parseDate(dateString)
})

type SetEndDateType = {
  type: ActionTypes.SetEndDate
  date: Date | null
}
const SetEndDate = (dateString: string): SetEndDateType => ({
  type: ActionTypes.SetEndDate,
  date: DateUtil.parseDate(dateString)
})
type StartType = {
  type: ActionTypes.Start
}
const Start: StartType = {
  type: ActionTypes.Start
}
type CancelType = {
  type: ActionTypes.Cancel
}
const Cancel: CancelType = {
  type: ActionTypes.Cancel
}
type SubmitType = {
  type: ActionTypes.Submit
}
const Submit: SubmitType = {
  type: ActionTypes.Submit
}

type ActionType = SetNameType | SetStartDateType | SetEndDateType | StartType | CancelType | SubmitType

export const MilestoneCreate = {
  SetName,
  SetStartDate,
  SetEndDate,
  Start,
  Cancel,
  Submit
}

const store = atomWithImmer<MilestoneCreateForm>(emptyForm)
export const milestoneCreateFormAtom = atom<MilestoneCreateForm, ActionType>(
  (get) => get(store),
  async (get, set, action) => {
    const curr = get(store)
    if (action.type === ActionTypes.Submit) {
      set(store, (c) => {
        ObjectUtil.copyContent(emptyForm, c)
      })
      const project = get(projectAtom)
      const input = {
        projectId: project.id,
        name: curr.name,
        startDate: curr.startDate,
        endDate: curr.endDate,
        description: ""
      }
      set(productBacklogAtom, {
        type: "MilestoneCreate",
        input
      })
    } else {
      set(store, (c) => {
        switch (action.type) {
          case ActionTypes.Start:
            c.creating = true
            break
          case ActionTypes.Cancel:
            ObjectUtil.copyContent(emptyForm, c)
            break
          case ActionTypes.SetName:
            c.name = action.name
            break
          case ActionTypes.SetEndDate:
            c.endDate = action.date
            break
          case ActionTypes.SetStartDate:
            c.startDate = action.date
            break
          default:
            throw new Error("unknown action type")
        }
      })
    }
  }
)
