import produce from "immer"
import { WritableDraft } from "immer/dist/types/types-external"
import { atom } from "jotai"
import { atomFamily } from "jotai/utils"
import { ArrayUtil } from "../../../util/ArrayUtil"
import { DateUtil } from "../../../util/DateUtil"
import { NLMoveAction } from "../../../util/NestedList"
import { BacklogApi } from "../../backlog/BacklogApiForReact"
import { IssueCreateInput, IssueData } from "../../backlog/Issue"
import { CustomNumberField, Version } from "../../backlog/ProjectInfo"
import {
  appSettingAtom,
  backlogApiAtom,
  issueTypesAtom,
  milestonesAtom,
  orderCustomFieldAtom,
  projectAtom,
  statusesAtom
} from "../app/State"
import { PBIChangeAction, PBIListData, PBIListDataHandler, PBIListMovedEvent } from "./PBIList/ListData"

const pbiListDataStoreAtom = atom<PBIListData | null>(null)

export type ProductBacklogCreateActionType = {
  type: "ProductBacklogCreate"
  summary: string
  milestone: Version | null
}

export type ProductBacklogAction = NLMoveAction | ProductBacklogCreateActionType

export const productBacklogAtom = atom<Promise<PBIListData>, ProductBacklogAction, Promise<void> | void>(
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
        events.push(...PBIListDataHandler.mutateByMoveAction(draft, action))
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
          PBIListDataHandler.mutateByIssueCreation(draft, created, orderCustomField)
        })
        set(pbiListDataStoreAtom, updated)
      }
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

export const selectedIssueIdAtom = atom<number | null>(null)

export const selectedIssueAtom = atom<IssueData | null, PBIChangeAction, Promise<void>>(
  (get) => {
    const selectedId = get(selectedIssueIdAtom)
    const data = get(productBacklogAtom)
    if (selectedId) {
      const [item] = PBIListDataHandler.findIssue(data, selectedId)
      return item
    }
    return null
  },
  async (get, set, action) => {
    set(pbiListDataStoreAtom, (data) => {
      data = data || get(productBacklogAtom)
      const statuses = get(statusesAtom)
      return produce(data, (draft) => {
        PBIListDataHandler.mutateByChangeAction(draft, statuses, action)
      })
    })
    const api = get(backlogApiAtom)
    const { issueId, input } = action
    await api.issue.editIssue(issueId, input)
  }
)

enum ChildIssueActionTypes {
  Move = "Move",
  Create = "Create"
}

type ChildIssueCreate = {
  type: ChildIssueActionTypes.Create
  input: IssueCreateInput
}
type ChildIssueMove = {
  type: ChildIssueActionTypes.Move
  issue: IssueData
  destinationIssueId: number
}

export type ChildIssueActionType = ChildIssueCreate | ChildIssueMove

export const ChildIssueAction = {
  Create: (input: IssueCreateInput): ChildIssueCreate => ({
    type: ChildIssueActionTypes.Create,
    input
  }),
  Move: (issue: IssueData, destinationIssueId: number): ChildIssueMove => ({
    type: ChildIssueActionTypes.Move,
    issue,
    destinationIssueId
  })
}

/* eslint @typescript-eslint/no-unused-vars: 0 */
const childIssueStoreAtom = atomFamily((_parentIssueId: number) => atom<ReadonlyArray<IssueData> | null>(null))

export const childIssueAtom = atomFamily((parentIssueId: number) =>
  atom(
    async (get) => {
      const stored = get(childIssueStoreAtom(parentIssueId))
      if (stored !== null) {
        return stored
      } else {
        const api = get(backlogApiAtom)
        const project = get(projectAtom)
        return await api.issue.searchChildren(project, parentIssueId)
      }
    },
    async (get, set, action: ChildIssueActionType) => {
      if (action.type === ChildIssueActionTypes.Move) {
        const { issue, destinationIssueId } = action
        const api = get(backlogApiAtom)
        const updated = await api.issue.editIssue(issue.id, { parentIssueId: destinationIssueId })
        const currSrc = get(childIssueAtom(parentIssueId))
        set(
          childIssueStoreAtom(parentIssueId),
          produce(currSrc, (draft) => {
            const idx = draft.findIndex((i) => i.id === issue.id)
            if (idx >= 0) {
              draft.splice(idx, 1)
            }
          })
        )
        const currDst = get(childIssueAtom(destinationIssueId))
        set(
          childIssueStoreAtom(destinationIssueId),
          produce(currDst, (draft) => {
            draft.push(updated as WritableDraft<IssueData>)
          })
        )
      }
    }
  )
)
