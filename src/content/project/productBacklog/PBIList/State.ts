import { atom } from "jotai"
import { atomWithImmer } from "jotai-immer"
import { atomFamily } from "jotai/utils"
import { DateUtil } from "../../../../util/DateUtil"
import { ObjectUtil } from "../../../../util/ObjectUtil"
import { ErrorData } from "../../../backlog/BacklogApiRequest"
import { projectAtom } from "../../app/State"
import { productBacklogAtom } from "../State"

export type MilestoneFormValues = {
  creating: boolean
  name: string
  startDate: Date | null
  endDate: Date | null
  errorMessage: string | null
}
const emptyForm: MilestoneFormValues = {
  creating: false,
  name: "",
  startDate: null,
  endDate: null,
  errorMessage: null
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

export const MilestoneFormAction = {
  SetName,
  SetStartDate,
  SetEndDate,
  Start,
  Cancel,
  Submit
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const store = atomFamily((_milestoneId: number) => atomWithImmer<MilestoneFormValues>(emptyForm))

export const milestoneFormAtom = atomFamily((milestoneId: number) =>
  atom<MilestoneFormValues, ActionType, Promise<void>>(
    (get) => get(store(milestoneId)),
    async (get, set, action) => {
      const curr = get(store(milestoneId))
      if (action.type === ActionTypes.Submit) {
        const project = get(projectAtom)
        const input = {
          projectId: project.id,
          name: curr.name,
          startDate: curr.startDate,
          endDate: curr.endDate,
          description: ""
        }
        try {
          await set(productBacklogAtom, {
            type: "MilestoneCreate",
            input
          })
          set(store(milestoneId), (c) => {
            ObjectUtil.copyContent(emptyForm, c)
          })
        } catch (e) {
          const err = e as ErrorData
          console.warn("failed to create milestone", err)
          set(store(milestoneId), (c) => {
            c.errorMessage = err.errors[0]?.message || "unknown error"
          })
        }
      } else {
        set(store(milestoneId), (c) => {
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
)
