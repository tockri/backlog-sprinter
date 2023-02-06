import produce from "immer"
import { WritableDraft } from "immer/dist/types/types-external"

import { atom } from "jotai"
import { ArrayUtil } from "../../../../util/ArrayUtil"
import { DateUtil } from "../../../../util/DateUtil"
import { NLLocation, NLMoveAction } from "../../../../util/NestedList"
import { Waiter } from "../../../../util/Waiter"
import { BacklogApi } from "../../../backlog/BacklogApiForReact"
import { EditIssueInput, IssueData } from "../../../backlog/Issue"
import { AddMilestoneInput, CustomNumberField, EditMilestoneInput, Version } from "../../../backlog/ProjectInfo"
import { Getter, Write } from "../../../util/JotaiUtil"
import { Api } from "../../app/state/Api"
import { AppConfig } from "../../app/state/AppConfig"
import { OrderCustomField } from "../../app/state/OrderCustomField"
import { IssueTypes, Milestones, ProjectAtom, Statuses } from "../../app/state/ProjectInfo"
import { PBIListData, PBIListDataHandler, PBIListMovedEvent } from "../PBIList/ListData"

const pbiListDataStoreAtom = atom<PBIListData | null>(null)

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

export type ProductBacklogAction =
  | NLMoveAction
  | AddIssueAction
  | AddMilestoneAction
  | EditIssueAction
  | EditMilestoneAction

const pbRead = async (get: Getter) => {
  const orderCustomField = get(OrderCustomField.atom)
  if (orderCustomField) {
    const stored = get(pbiListDataStoreAtom)
    if (stored) {
      return stored
    } else {
      const project = get(ProjectAtom.atom)
      const api = get(Api.atom)
      const conf = get(AppConfig.atom)
      const milestones = get(Milestones.atom)
      const today = new Date()
      const milestoneFilter = milestones.filter(
        (ms) =>
          !ms.archived &&
          ms.startDate &&
          ms.releaseDueDate &&
          DateUtil.diffDays(today, new Date(ms.releaseDueDate)) > -3
      )
      const list = await api.issue.searchInIssueTypeAndMilestones(project, conf.pbiIssueTypeId, milestoneFilter)
      return PBIListDataHandler.nestIssues(list, orderCustomField)
    }
  } else {
    throw new Error("orderCustomField is not set.")
  }
}

const pbMove: Write<NLMoveAction> = async (get, set, action) => {
  const prev = get(productBacklogAtom)
  const events: PBIListMovedEvent[] = []
  const updated = produce(prev, (draft) => {
    events.push(...PBIListDataHandler.mutateByMovingAction(draft, action))
  })
  if (events.length) {
    const api = get(Api.atom)
    const orderCustomField = get(OrderCustomField.atom)
    if (orderCustomField) {
      await updateIssues(orderCustomField, events, api).then()
    }
  }
  set(pbiListDataStoreAtom, updated)
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

const pbAddIssue: Write<AddIssueAction> = async (get, set, action) => {
  const prev = get(productBacklogAtom)
  const conf = get(AppConfig.atom)
  const issueType = get(IssueTypes.atom).find((it) => it.id === conf.pbiIssueTypeId)
  const orderCustomField = get(OrderCustomField.atom)
  if (issueType && orderCustomField) {
    const project = get(ProjectAtom.atom)
    const api = get(Api.atom)
    const order = PBIListDataHandler.getNewOrder(prev, action.milestone)
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
    const updated = produce(prev, (draft) => {
      PBIListDataHandler.mutateByAddingIssue(draft, created, orderCustomField)
    })
    set(pbiListDataStoreAtom, updated)
  }
}

const pbAddMilestone: Write<AddMilestoneAction> = async (get, set, action) => {
  const prev = get(productBacklogAtom)
  const api = get(Api.atom)
  const project = get(ProjectAtom.atom)
  const created = await api.projectInfo.addMilestone(project.id, action.input)
  set(Milestones.atom, (c) => {
    c.push(created as WritableDraft<Version>)
  })
  set(
    pbiListDataStoreAtom,
    produce(prev, (draft) => {
      PBIListDataHandler.mutateByAddingMilestone(draft, created)
    })
  )
}

const pbEditMilestone: Write<EditMilestoneAction> = async (get, set, action) => {
  const prev = get(productBacklogAtom)
  const api = get(Api.atom)
  const project = get(ProjectAtom.atom)
  const updated = await api.projectInfo.editMilestone(project.id, action.milestoneId, action.input)
  set(Milestones.atom, (c) => {
    const idx = c.findIndex((ms) => ms.id === updated.id)
    if (idx >= 0) {
      c.splice(idx, 1, updated as WritableDraft<Version>)
    }
  })
  set(
    pbiListDataStoreAtom,
    produce(prev, (draft) => {
      PBIListDataHandler.mutateByEditingMilestone(draft, updated)
    })
  )
}

const pbEditIssue: Write<EditIssueAction> = async (get, set, action) => {
  const prev = get(productBacklogAtom)
  const api = get(Api.atom)
  const { issueId, input } = action
  await api.issue.editIssue(issueId, input)
  const statuses = get(Statuses.atom)
  const updated = produce(prev, (draft) => {
    PBIListDataHandler.mutateByEditingIssue(draft, statuses, issueId, input)
  })
  set(pbiListDataStoreAtom, updated)
}

const productBacklogAtom = atom<Promise<PBIListData>, ProductBacklogAction, Promise<void> | void>(
  pbRead,
  async (get, set, action) => {
    if (action.type === "NLMove") {
      await pbMove(get, set, action)
    } else if (action.type === "AddIssue") {
      await pbAddIssue(get, set, action)
    } else if (action.type === "AddMilestone") {
      await pbAddMilestone(get, set, action)
    } else if (action.type === "EditMilestone") {
      await pbEditMilestone(get, set, action)
    } else if (action.type === "EditIssue") {
      await pbEditIssue(get, set, action)
    }
  }
)

export const ProductBacklog = {
  atom: productBacklogAtom,
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
