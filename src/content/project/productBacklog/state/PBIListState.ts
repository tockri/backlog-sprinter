import { produce } from "immer"
import { ArrayUtil } from "../../../../util/ArrayUtil"
import { DateUtil } from "../../../../util/DateUtil"
import { NLLocation, NLMoveAction } from "../../../../util/NestedList"
import { Waiter } from "../../../../util/Waiter"
import { BacklogApi } from "../../../backlog/BacklogApi"
import { EditIssueInput, Issue } from "../../../backlog/IssueApi"
import { AddMilestoneInput, CustomNumberField, EditMilestoneInput, Version } from "../../../backlog/ProjectInfoApi"
import { ApiState } from "../../../state/ApiState"
import { BspConfState } from "../../../state/BspConfState"
import { IssueTypesState, MilestonesState, ProjectState, StatusesState } from "../../../state/ProjectInfoState"
import { AsyncHandler, AsyncRead, JotaiUtil } from "../../../util/JotaiUtil"
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
    const bspConf = get(BspConfState.atom)
    const project = await get(ProjectState.atom)
    const api = get(ApiState.atom)
    const milestones = await get(MilestonesState.atom)
    const today = new Date()
    const milestoneFilter = milestones.filter(
      (ms) =>
        !ms.archived && ms.startDate && ms.releaseDueDate && DateUtil.diffDays(today, new Date(ms.releaseDueDate)) > -3
    )
    const list = await api.issue.searchInIssueTypeAndMilestones(project.id, bspConf.pbiIssueTypeId, milestoneFilter)
    return PBIListFunc.nestIssues(
      list.filter((i) => {
        if (bspConf.hideCompletedPbi) {
          return i.status.id !== 4
        }
        return true
      }),
      orderCustomField
    )
  } else {
    throw new Error("orderCustomField is not set.")
  }
}

const pbMove: AsyncHandler<PBIList, PBIListAction> = async (prev, get, set, _action) => {
  const action = _action as NLMoveAction
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

const pbAddIssue: AsyncHandler<PBIList, PBIListAction> = async (prev, get, set, _action) => {
  const action = _action as AddIssueAction
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

const pbAddMilestone: AsyncHandler<PBIList, PBIListAction> = async (prev, get, set, _action) => {
  const action = _action as AddMilestoneAction
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

const pbEditMilestone: AsyncHandler<PBIList, PBIListAction> = async (prev, get, set, _action) => {
  const action = _action as EditMilestoneAction
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

const pbArchiveMilestone: AsyncHandler<PBIList, PBIListAction> = async (prev, get, set, _action) => {
  const action = _action as ArchiveMilestoneAction
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

const pbEditIssue: AsyncHandler<PBIList, PBIListAction> = async (prev, get, set, _action) => {
  const action = _action as EditIssueAction
  const api = get(ApiState.atom)
  const { issueId, input } = action
  await api.issue.edit(issueId, input)
  const statuses = await get(StatusesState.atom)
  return produce(prev, (draft) => {
    PBIListFunc.mutateByEditIssue(draft, statuses, issueId, input)
  })
}

const mainAtom = JotaiUtil.asyncAtomWithAction<PBIList, PBIListAction>(
  pbRead,
  JotaiUtil.composeAsyncHandlers({
    NLMove: pbMove,
    AddIssue: pbAddIssue,
    AddMilestone: pbAddMilestone,
    EditMilestone: pbEditMilestone,
    ArchiveMilestone: pbArchiveMilestone,
    EditIssue: pbEditIssue,
    Reload: () => null
  })
)
mainAtom.onMount = (setAtom) => {
  return () => {
    setAtom({ type: "Reload" }).then()
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
    }),
    Reload: (): ReloadAction => ({
      type: "Reload"
    })
  }
} as const
