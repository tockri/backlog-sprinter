import { atom } from "jotai"
import { atomWithImmer } from "jotai-immer"
import { atomFamily } from "jotai/utils"
import { DateUtil } from "../../../../util/DateUtil"
import { ObjectUtil } from "../../../../util/ObjectUtil"
import { ErrorData } from "../../../backlog/BacklogApiRequest"
import { projectAtom } from "../../app/State"
import { ProductBacklog } from "./ProductBacklog"

type Values = {
  creating: boolean
  name: string
  startDate: Date | null
  endDate: Date | null
  errorMessage: string | null
}

const emptyForm: Values = {
  creating: false,
  name: "",
  startDate: null,
  endDate: null,
  errorMessage: null
}

enum Types {
  Start = "Start",
  Create = "Create",
  Cancel = "Cancel",
  SetName = "SetName",
  SetStartDate = "SetStartDate",
  SetEndDate = "SetEndDate",
  Submit = "Submit"
}

type SetNameType = {
  type: Types.SetName
  name: string
}

const SetName = (name: string): SetNameType => ({
  type: Types.SetName,
  name
})

type SetStartDateType = {
  type: Types.SetStartDate
  date: Date | null
}

const SetStartDate = (dateString: string): SetStartDateType => ({
  type: Types.SetStartDate,
  date: DateUtil.parseDate(dateString)
})

type SetEndDateType = {
  type: Types.SetEndDate
  date: Date | null
}

const SetEndDate = (dateString: string): SetEndDateType => ({
  type: Types.SetEndDate,
  date: DateUtil.parseDate(dateString)
})

type StartType = {
  type: Types.Start
}

const Start: StartType = {
  type: Types.Start
}

type CancelType = {
  type: Types.Cancel
}

const Cancel: CancelType = {
  type: Types.Cancel
}

type SubmitType = {
  type: Types.Submit
}

const Submit: SubmitType = {
  type: Types.Submit
}

type ActionType = SetNameType | SetStartDateType | SetEndDateType | StartType | CancelType | SubmitType

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const store = atomFamily((_milestoneId: number) => atomWithImmer<Values>(emptyForm))

const interfaceAtom = atomFamily((milestoneId: number) =>
  atom<Values, ActionType, Promise<void>>(
    (get) => get(store(milestoneId)),
    async (get, set, action) => {
      const curr = get(store(milestoneId))
      if (action.type === Types.Submit) {
        const project = get(projectAtom)
        const input = {
          projectId: project.id,
          name: curr.name,
          startDate: curr.startDate,
          endDate: curr.endDate,
          description: ""
        }
        try {
          await set(ProductBacklog.atom, {
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
            case Types.Start:
              c.creating = true
              break
            case Types.Cancel:
              ObjectUtil.copyContent(emptyForm, c)
              break
            case Types.SetName:
              c.name = action.name
              break
            case Types.SetEndDate:
              c.endDate = action.date
              break
            case Types.SetStartDate:
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

export type MilestoneFormValues = Values

export type MilestoneFormAction = ActionType

export const MilestoneForm = {
  storeAtom_FOR_TEST: store,
  atom: interfaceAtom,
  Action: {
    SetName,
    SetStartDate,
    SetEndDate,
    Start,
    Cancel,
    Submit
  }
}
