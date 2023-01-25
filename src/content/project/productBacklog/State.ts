import produce from "immer"
import { atom } from "jotai"
import { ArrayUtil } from "../../../util/ArrayUtil"
import { NLMoveAction } from "../../../util/NestedList"
import { BacklogApi } from "../../backlog/BacklogApiForReact"
import { IssueData } from "../../backlog/Issue"
import { CustomNumberField } from "../../backlog/ProjectInfo"
import { appSettingAtom, backlogApiAtom, milestonesAtom, orderCustomFieldAtom, projectAtom } from "../app/State"
import { PBIChangeAction, PBIListData, PBIListDataHandler, PBIListMovedEvent } from "./PBIList/ListData"

const pbiListDataStoreAtom = atom<PBIListData | null>(null)

export const productBacklogAtom = atom<Promise<PBIListData>, NLMoveAction, Promise<void> | void>(
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
        const today = new Date().getTime()
        const milestoneFilter = milestones.filter(
          (ms) => !ms.archived && ms.startDate && ms.releaseDueDate && Date.parse(ms.releaseDueDate) > today
        )
        const list = await api.issue.searchInIssueTypeAndMilestones(project, setting.pbiIssueTypeId, milestoneFilter)
        return PBIListDataHandler.nestIssues(list, orderCustomField)
      }
    } else {
      throw new Error("orderCustomField is not set.")
    }
  },
  async (get, set, moveAction) => {
    const prev = get(productBacklogAtom)
    const events: PBIListMovedEvent[] = []
    const updated = produce(prev, (draft) => {
      events.push(...PBIListDataHandler.mutateByMoveAction(draft, moveAction))
    })
    if (events.length) {
      const api = get(backlogApiAtom)
      const orderCustomField = get(orderCustomFieldAtom)
      if (orderCustomField) {
        await updateIssues(orderCustomField, events, api).then()
      }
    }
    set(pbiListDataStoreAtom, updated)
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
      return produce(data, (draft) => {
        PBIListDataHandler.mutateByChangeAction(draft, action)
      })
    })
    const api = get(backlogApiAtom)
    const { issueId, input } = action
    await api.issue.changeInfo(issueId, input)
  }
)
