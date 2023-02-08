import produce from "immer"
import { WritableDraft } from "immer/dist/types/types-external"

import { ArrayUtil } from "../../../../util/ArrayUtil"
import { DateUtil } from "../../../../util/DateUtil"
import { NLLocation, NLMoveAction } from "../../../../util/NestedList"
import { Waiter } from "../../../../util/Waiter"
import { BacklogApi } from "../../../backlog/BacklogApiForReact"
import { EditIssueInput, IssueData } from "../../../backlog/Issue"
import { AddMilestoneInput, CustomNumberField, EditMilestoneInput, Version } from "../../../backlog/ProjectInfo"
import { AsyncRead, Handler, JotaiUtil } from "../../../util/JotaiUtil"
import { Api } from "../../app/state/Api"
import { AppConfState } from "../../app/state/AppConfState"
import { OrderCustomFieldState } from "../../app/state/OrderCustomFieldState"
import { IssueTypesState, MilestonesState, ProjectState, StatusesState } from "../../app/state/ProjectInfoState"
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

export type PBIListAction = NLMoveAction | AddIssueAction | AddMilestoneAction | EditIssueAction | EditMilestoneAction

const pbRead: AsyncRead<PBIList> = async (get) => {
  const orderCustomField = await get(OrderCustomFieldState.atom)
  if (orderCustomField) {
    const project = await get(ProjectState.atom)
    const api = get(Api.atom)
    const conf = get(AppConfState.atom)
    const milestones = await get(MilestonesState.atom)
    const today = new Date()
    const milestoneFilter = milestones.filter(
      (ms) =>
        !ms.archived && ms.startDate && ms.releaseDueDate && DateUtil.diffDays(today, new Date(ms.releaseDueDate)) > -3
    )
    const list = await api.issue.searchInIssueTypeAndMilestones(project, conf.pbiIssueTypeId, milestoneFilter)
    return PBIListFunc.nestIssues(list, orderCustomField)
  } else {
    throw new Error("orderCustomField is not set.")
  }
}

const pbMove: Handler<PBIList, NLMoveAction> = async (prev, get, set, action) => {
  const events: PBIListMovedEvent[] = []
  const updated = produce(prev, (draft) => {
    events.push(...PBIListFunc.mutateByMovingAction(draft, action))
  })
  if (events.length) {
    const api = get(Api.atom)
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
): Promise<ReadonlyArray<IssueData>> => {
  const chunked = ArrayUtil.chunk(events, 5)
  const updated: IssueData[] = []

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

const pbAddIssue: Handler<PBIList, AddIssueAction> = async (prev, get, set, action) => {
  const conf = get(AppConfState.atom)
  const issueType = (await get(IssueTypesState.atom)).find((it) => it.id === conf.pbiIssueTypeId)
  const orderCustomField = await get(OrderCustomFieldState.atom)
  if (issueType && orderCustomField) {
    const project = await get(ProjectState.atom)
    const api = get(Api.atom)
    const order = PBIListFunc.getNewOrder(prev, action.milestone)
    const created = await api.issue.createIssue({
      project,
      issueType,
      summary: action.summary,
      milestoneId: action.milestone?.id,
      customField: {
        id: orderCustomField.id,
        value: order
      }
    })
    return produce(prev, (draft) => {
      PBIListFunc.mutateByAddingIssue(draft, created, orderCustomField)
    })
  } else {
    return prev
  }
}

const pbAddMilestone: Handler<PBIList, AddMilestoneAction> = async (prev, get, set, action) => {
  const api = get(Api.atom)
  const project = await get(ProjectState.atom)
  const created = await api.projectInfo.addMilestone(project.id, action.input)
  const milestones = await get(MilestonesState.atom)
  await set(
    MilestonesState.atom,
    produce(milestones, (c) => {
      c.push(created as WritableDraft<Version>)
    })
  )
  return produce(prev, (draft) => {
    PBIListFunc.mutateByAddingMilestone(draft, created)
  })
}

const pbEditMilestone: Handler<PBIList, EditMilestoneAction> = async (prev, get, set, action) => {
  const api = get(Api.atom)
  const project = await get(ProjectState.atom)
  const updated = await api.projectInfo.editMilestone(project.id, action.milestoneId, action.input)
  const milestones = await get(MilestonesState.atom)
  set(
    MilestonesState.atom,
    produce(milestones, (c) => {
      const idx = c.findIndex((ms) => ms.id === updated.id)
      if (idx >= 0) {
        c.splice(idx, 1, updated as WritableDraft<Version>)
      }
    })
  )
  return produce(prev, (draft) => {
    PBIListFunc.mutateByEditingMilestone(draft, updated)
  })
}

const pbEditIssue: Handler<PBIList, EditIssueAction> = async (prev, get, set, action) => {
  const api = get(Api.atom)
  const { issueId, input } = action
  await api.issue.editIssue(issueId, input)
  const statuses = await get(StatusesState.atom)
  return produce(prev, (draft) => {
    PBIListFunc.mutateByEditingIssue(draft, statuses, issueId, input)
  })
}

const mainAtom = JotaiUtil.asyncAtomWithAction<PBIList, PBIListAction>(pbRead, (prev, get, set, action) => {
  if (action.type === "NLMove") {
    return pbMove(prev, get, set, action)
  } else if (action.type === "AddIssue") {
    return pbAddIssue(prev, get, set, action)
  } else if (action.type === "AddMilestone") {
    return pbAddMilestone(prev, get, set, action)
  } else if (action.type === "EditMilestone") {
    return pbEditMilestone(prev, get, set, action)
  } else if (action.type === "EditIssue") {
    return pbEditIssue(prev, get, set, action)
  } else {
    throw new Error(`unknown type : ${action}`)
  }
})

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
    ListMove: (src: NLLocation, dst: NLLocation): NLMoveAction => ({
      type: "NLMove",
      src,
      dst
    })
  }
}
