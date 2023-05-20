import produce from "immer"

import { BacklogApi } from "@/content/backlog/BacklogApi"
import { ArrayUtil } from "@/util/ArrayUtil"
import { DateUtil } from "@/util/DateUtil"
import { NLLocation, NLMoveAction } from "@/util/NestedList"
import { Waiter } from "@/util/Waiter"
import { EditIssueInput, Issue } from "../../../backlog/IssueApi"
import { AddMilestoneInput, CustomNumberField, EditMilestoneInput, Version } from "../../../backlog/ProjectInfoApi"
import { AsyncHandler, AsyncRead, JotaiUtil } from "../../../util/JotaiUtil"

import { ApiState } from "@/content/state/ApiState"
import { BspConfState } from "@/content/state/BspConfState"
import { IssueTypesState, MilestonesState, ProjectState, StatusesState } from "../../../state/ProjectInfoState"
import { OrderCustomFieldState } from "../../state/OrderCustomFieldState"
import { PBIList, PBIListFunc, PBIListMovedEvent } from "./PBIList"

type AddIssueAction = {
  type: "AddIssue"
  summary: string
  milestone: Version | null
}

type AddMilestoneAction = {
  type: "AddMilestone"
  input: AddMilestoneInput
}

type EditMilestoneAction = {
  type: "EditMilestone"
  projectId: number
  milestoneId: number
  input: EditMilestoneInput
}

type EditIssueAction = {
  type: "EditIssue"
  issueId: number
  input: EditIssueInput
}

type ArchiveMilestoneAction = {
  type: "ArchiveMilestone"
  milestone: Version
}

type ReloadAction = {
  type: "Reload"
}

export type PBIListAction =
  | NLMoveAction
  | AddIssueAction
  | AddMilestoneAction
  | EditIssueAction
  | EditMilestoneAction
  | ArchiveMilestoneAction
  | ReloadAction

const pbRead: AsyncRead<PBIList> = async (get) => {
  const orderCustomField = await get(OrderCustomFieldState.atom)
  if (orderCustomField) {
    const project = await get(ProjectState.atom)
    const api = get(ApiState.atom)
    const bspConf = get(BspConfState.atom)
    const milestones = await get(MilestonesState.atom)
    const today = new Date()
    const milestoneFilter = milestones.filter(
      (ms) =>
        !ms.archived && ms.startDate && ms.releaseDueDate && DateUtil.diffDays(today, new Date(ms.releaseDueDate)) > -3
    )
    const list = await api.issue.searchInIssueTypeAndMilestones(project.id, bspConf.pbiIssueTypeId, milestoneFilter)
    return PBIListFunc.nestIssues(list, orderCustomField)
  } else {
    throw new Error("orderCustomField is not set.")
  }
}

const pbMove: AsyncHandler<PBIList, NLMoveAction> = async (prev, get, set, action) => {
  const events: PBIListMovedEvent[] = []
  const updated = produce(prev, (draft) => {
    events.push(...PBIListFunc.mutateByMove(draft, action))
  })
  if (events.length) {
    const api = get(ApiState.atom)
    const orderCustomField = await get(OrderCustomFieldState.atom)
    if (orderCustomField) {
      await updateIssues(orderCustomField, events, api).then()
    }
  }
  return updated
}

const updateIssues = async (
  customField: CustomNumberField,
  events: ReadonlyArray<PBIListMovedEvent>,
  api: BacklogApi
): Promise<ReadonlyArray<Issue>> => {
  const chunked = ArrayUtil.chunk(events, 5)
  const updated: Issue[] = []

  for (let i = 0; i < chunked.length; i++) {
    const chunk = chunked[i]
    const issues = await Promise.all(
      chunk.map((ev) =>
        api.issue.changeMilestoneAndCustomFieldValue(
          ev.issueId,
          ev.milestoneId !== undefined ? ev.milestoneId : null,
          ev.order !== undefined ? ev.order : null,
          customField
        )
      )
    )
    updated.push(...issues)
    if (i !== chunked.length - 1) {
      await Waiter.sleep(500)
    }
  }
  return updated
}

const pbAddIssue: AsyncHandler<PBIList, AddIssueAction> = async (prev, get, set, action) => {
  const issueType = await get(IssueTypesState.pbiIssueTypeAtom)
  const orderCustomField = await get(OrderCustomFieldState.atom)
  if (issueType && orderCustomField) {
    const project = await get(ProjectState.atom)
    const api = get(ApiState.atom)
    const order = PBIListFunc.getNewOrder(prev, action.milestone)
    const created = await api.issue.add({
      projectId: project.id,
      issueTypeId: issueType.id,
      summary: action.summary,
      description: issueType.templateDescription || "",
      milestoneId: action.milestone?.id,
      customField: {
        id: orderCustomField.id,
        value: order
      }
    })
    return produce(prev, (draft) => {
      PBIListFunc.mutateByAddIssue(draft, created, orderCustomField)
    })
  } else {
    return prev
  }
}

const pbAddMilestone: AsyncHandler<PBIList, AddMilestoneAction> = async (prev, get, set, action) => {
  let created: Version | null = null
  await set(
    MilestonesState.atom,
    MilestonesState.Action.Add(action.input, (ms) => {
      created = ms
    })
  )

  return produce(prev, (draft) => {
    if (created) {
      PBIListFunc.mutateByAddMilestone(draft, created)
    }
  })
}

const pbEditMilestone: AsyncHandler<PBIList, EditMilestoneAction> = async (prev, get, set, action) => {
  let updated: Version | null = null
  await set(
    MilestonesState.atom,
    MilestonesState.Action.Edit(action.milestoneId, action.input, (ms) => {
      updated = ms
    })
  )
  return produce(prev, (draft) => {
    if (updated) {
      PBIListFunc.mutateByEditMilestone(draft, updated)
    }
  })
}

const pbArchiveMilestone: AsyncHandler<PBIList, ArchiveMilestoneAction> = async (prev, get, set, action) => {
  let archived: Version | null = null
  await set(
    MilestonesState.atom,
    MilestonesState.Action.Archive(action.milestone, (ms) => {
      archived = ms
    })
  )
  return produce(prev, (draft) => {
    if (archived) {
      PBIListFunc.mutateByArchiveMilestone(draft, archived)
    }
  })
}

const pbEditIssue: AsyncHandler<PBIList, EditIssueAction> = async (prev, get, set, action) => {
  const api = get(ApiState.atom)
  const { issueId, input } = action
  await api.issue.edit(issueId, input)
  const statuses = await get(StatusesState.atom)
  return produce(prev, (draft) => {
    PBIListFunc.mutateByEditIssue(draft, statuses, issueId, input)
  })
}

const mainAtom = JotaiUtil.asyncAtomWithAction<PBIList, PBIListAction>(pbRead, () => (prev, get, set, action) => {
  if (action.type === "NLMove") {
    return pbMove(prev, get, set, action)
  } else if (action.type === "AddIssue") {
    return pbAddIssue(prev, get, set, action)
  } else if (action.type === "AddMilestone") {
    return pbAddMilestone(prev, get, set, action)
  } else if (action.type === "EditMilestone") {
    return pbEditMilestone(prev, get, set, action)
  } else if (action.type === "ArchiveMilestone") {
    return pbArchiveMilestone(prev, get, set, action)
  } else if (action.type === "EditIssue") {
    return pbEditIssue(prev, get, set, action)
  } else if (action.type === "Reload") {
    return null
  } else {
    throw new Error(`unknown type : ${action}`)
  }
})

mainAtom.onMount = (setAtom) => {
  return async () => {
    await setAtom({ type: "Reload" })
  }
}

export const PBIListState = {
  atom: mainAtom,
  Action: {
    AddIssue: (summary: string, milestone: Version | null): AddIssueAction => ({
      type: "AddIssue",
      summary,
      milestone
    }),
    EditIssue: (issueId: number, input: EditIssueInput): EditIssueAction => ({
      type: "EditIssue",
      issueId,
      input
    }),
    AddMilestone: (input: AddMilestoneInput): AddMilestoneAction => ({
      type: "AddMilestone",
      input
    }),
    EditMilestone: (projectId: number, milestoneId: number, input: EditMilestoneInput): EditMilestoneAction => ({
      type: "EditMilestone",
      projectId,
      milestoneId,
      input
    }),
    ArchiveMilestone: (milestone: Version): ArchiveMilestoneAction => ({
      type: "ArchiveMilestone",
      milestone
    }),
    ListMove: (src: NLLocation, dst: NLLocation): NLMoveAction => ({
      type: "NLMove",
      src,
      dst
    })
  }
} as const
