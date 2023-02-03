import produce from "immer"
import { WritableDraft } from "immer/dist/types/types-external"
import { atom } from "jotai"

import { ArrayUtil } from "../../../../util/ArrayUtil"
import { DateUtil } from "../../../../util/DateUtil"
import { NLLocation, NLMoveAction } from "../../../../util/NestedList"
import { BacklogApi } from "../../../backlog/BacklogApiForReact"
import { IssueChangeInput, IssueData } from "../../../backlog/Issue"
import { CustomNumberField, MilestoneInput, Version } from "../../../backlog/ProjectInfo"
import {
  appSettingAtom,
  backlogApiAtom,
  issueTypesAtom,
  milestonesAtom,
  orderCustomFieldAtom,
  projectAtom,
  statusesAtom
} from "../../app/State"
import { PBIListData, PBIListDataHandler, PBIListMovedEvent } from "../PBIList/ListData"

const pbiListDataStoreAtom = atom<PBIListData | null>(null)

type AddIssueAction = {
  type: "ProductBacklogCreate"
  summary: string
  milestone: Version | null
}
const AddIssue = (summary: string, milestone: Version | null): AddIssueAction => ({
  type: "ProductBacklogCreate",
  summary,
  milestone
})

type AddMilestoneAction = {
  type: "MilestoneCreate"
  input: MilestoneInput
}

const AddMilestone = (input: MilestoneInput): AddMilestoneAction => ({
  type: "MilestoneCreate",
  input
})

type EditIssueAction = {
  type: "EditIssue"
  issueId: number
  input: IssueChangeInput
}

const EditIssue = (issueId: number, input: IssueChangeInput): EditIssueAction => ({
  type: "EditIssue",
  issueId,
  input
})

const ListMove = (src: NLLocation, dst: NLLocation): NLMoveAction => ({
  type: "NLMove",
  src,
  dst
})

type Action = NLMoveAction | AddIssueAction | AddMilestoneAction | EditIssueAction

const productBacklogAtom = atom<Promise<PBIListData>, Action, Promise<void> | void>(
  async (get) => {
    const orderCustomField = get(orderCustomFieldAtom)
    if (orderCustomField) {
      const stored = get(pbiListDataStoreAtom)
      if (stored) {
        return stored
      } else {
        const project = get(projectAtom)
        const api = get(backlogApiAtom)
        const setting = get(appSettingAtom)
        const milestones = get(milestonesAtom)
        const today = new Date()
        const milestoneFilter = milestones.filter(
          (ms) =>
            !ms.archived &&
            ms.startDate &&
            ms.releaseDueDate &&
            DateUtil.diffDays(today, new Date(ms.releaseDueDate)) > -3
        )
        const list = await api.issue.searchInIssueTypeAndMilestones(project, setting.pbiIssueTypeId, milestoneFilter)
        return PBIListDataHandler.nestIssues(list, orderCustomField)
      }
    } else {
      throw new Error("orderCustomField is not set.")
    }
  },
  async (get, set, action) => {
    const prev = get(productBacklogAtom)
    if (action.type === "NLMove") {
      const events: PBIListMovedEvent[] = []
      const updated = produce(prev, (draft) => {
        events.push(...PBIListDataHandler.mutateByMovingAction(draft, action))
      })
      if (events.length) {
        const api = get(backlogApiAtom)
        const orderCustomField = get(orderCustomFieldAtom)
        if (orderCustomField) {
          await updateIssues(orderCustomField, events, api).then()
        }
      }
      set(pbiListDataStoreAtom, updated)
    } else if (action.type === "ProductBacklogCreate") {
      const setting = get(appSettingAtom)
      const issueType = get(issueTypesAtom).find((it) => it.id === setting.pbiIssueTypeId)
      const orderCustomField = get(orderCustomFieldAtom)
      if (issueType && orderCustomField) {
        const project = get(projectAtom)
        const api = get(backlogApiAtom)
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
    } else if (action.type === "MilestoneCreate") {
      const api = get(backlogApiAtom)
      const created = await api.projectInfo.createMilestone(action.input)
      set(milestonesAtom, (c) => {
        c.push(created as WritableDraft<Version>)
      })
      const updated = produce(prev, (draft) => {
        PBIListDataHandler.mutateByAddingMilestone(draft, created)
      })
      set(pbiListDataStoreAtom, updated)
    } else if (action.type === "EditIssue") {
      const api = get(backlogApiAtom)
      const { issueId, input } = action
      await api.issue.editIssue(issueId, input)
      const statuses = get(statusesAtom)
      const updated = produce(prev, (draft) => {
        PBIListDataHandler.mutateByEditingIssue(draft, statuses, issueId, input)
      })
      set(pbiListDataStoreAtom, updated)
    }
  }
)

const updateIssues = async (
  customField: CustomNumberField,
  events: ReadonlyArray<PBIListMovedEvent>,
  api: BacklogApi
): Promise<ReadonlyArray<IssueData>> => {
  const chunked = ArrayUtil.chunk(events, 5)
  const updated: IssueData[] = []
  for (const chunk of chunked) {
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
  }
  return updated
}

export type ProductBacklogAction = Action

export const ProductBacklog = {
  atom: productBacklogAtom,
  Action: {
    AddIssue,
    EditIssue,
    AddMilestone,
    ListMove
  }
}
