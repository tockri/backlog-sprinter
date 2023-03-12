import { WritableDraft } from "immer/dist/internal"
import { NestedList, NestedListData, NestMethods, NLMoveAction } from "../../../../util/NestedList"
import { EditIssueInput, Issue, IssueUtil } from "../../../backlog/IssueApi"
import { CustomNumberField, Status, Version } from "../../../backlog/ProjectInfoApi"

export type IssueDataWithOrder = Issue & { readonly order: number | null }
export type PBIList = NestedListData<Version, IssueDataWithOrder>

export type PBIListMovedEvent = {
  issueId: number
  milestoneId?: number | null
  order?: number | null
}

const headSortKey = (head: Version | null) =>
  head && head.releaseDueDate ? Date.parse(head.releaseDueDate) : Number.MAX_VALUE

const pbiNestMethods: NestMethods<Version, IssueDataWithOrder> = {
  itemToHead: (item) => item.milestone.find((m) => m.startDate && m.releaseDueDate) || null,
  itemComparator: (item1, item2) => NestedList.compareNullable(item1.order, item2.order),
  headId: (head) => (head ? "" + head.id : "--"),
  headComparator: (head1, head2) => NestedList.compareNullable(headSortKey(head1), headSortKey(head2))
}

const nest = (items: ReadonlyArray<IssueDataWithOrder>): PBIList => {
  return NestedList.nest<Version, IssueDataWithOrder>(items, pbiNestMethods)
}

const nestIssues = (issues: ReadonlyArray<Issue>, orderCustomField: CustomNumberField): PBIList =>
  nest(issues.map(withOrder(orderCustomField)))

const withOrder =
  (orderCustomField: CustomNumberField) =>
  (issue: Issue): IssueDataWithOrder => ({ ...issue, order: getOrderValue(orderCustomField, issue) })

const getOrderValue = (orderCustomField: CustomNumberField, issue: Issue): number | null => {
  const field = issue.customFields.find((cf) => cf.id === orderCustomField.id)
  if (field) {
    return field.value !== null ? Number(field.value) : null
  } else {
    return null
  }
}
class EventStore {
  private readonly events: Record<number, PBIListMovedEvent> = {}
  eventExists(issueId: number): boolean {
    return !!this.events[issueId]
  }
  eventOf(issueId: number): PBIListMovedEvent {
    if (!this.events[issueId]) {
      this.events[issueId] = { issueId }
    }
    return this.events[issueId]
  }
  values(): PBIListMovedEvent[] {
    return Object.values(this.events)
  }
}

export type PBISubList = PBIList["subLists"][number]

type Work = {
  readonly issueId: number
  order: number | null
  event: PBIListMovedEvent | null
}
const makeWorkingArray = (subList: PBISubList): Work[] =>
  subList.items.map((item) => ({
    issueId: item.id,
    order: item.order,
    event: null
  }))

const patchIndex = (eventStore: EventStore, works: Work[], index: number) => {
  const target = works[index]
  const left = index > 0 ? works[index - 1] : null
  const right = index < works.length - 1 ? works[index + 1] : null
  const setOrder = (newOrder: number) => {
    if (target.order !== newOrder) {
      target.event = eventStore.eventOf(target.issueId)
      target.order = newOrder
      target.event.order = newOrder
    }
  }
  if (target.order === null) {
    setOrder(0)
  }
  const to = () => target.order || 0
  if (left && right) {
    const lo = left.order !== null ? left.order : Number.MIN_VALUE
    const ro = right.order !== null ? right.order : Number.MIN_VALUE
    if (to() <= lo || to() >= ro) {
      if (lo + 2 < ro) {
        setOrder(Math.floor((lo + ro) / 2))
      } else {
        setOrder(lo + 30)
      }
      if (to() <= lo || left.order === null) {
        if (!left.event) {
          patchIndex(eventStore, works, index - 1)
        }
      }
      if (to() >= ro || right.order === null) {
        if (!right.event) {
          patchIndex(eventStore, works, index + 1)
        }
      }
    }
  } else if (!left && right) {
    if (right.order === null) {
      patchIndex(eventStore, works, index + 1)
    } else {
      setOrder(right.order - 100)
    }
  } else if (left && !right) {
    if (left.order === null) {
      patchIndex(eventStore, works, index - 1)
    } else {
      setOrder(left.order + 100)
    }
  }
}

const indexAfterMove = (action: NLMoveAction): number => {
  const { src, dst } = action
  if (src.subListId === dst.subListId && src.index < dst.index) {
    return dst.index - 1
  } else {
    return dst.index
  }
}

const mutateByMove = (data: WritableDraft<PBIList>, action: NLMoveAction): PBIListMovedEvent[] => {
  NestedList.mutateMove(data, action)
  const eventStore = new EventStore()
  const subList = data.subLists.find((sl) => sl.id === action.dst.subListId)
  if (subList) {
    const index = indexAfterMove(action)
    const works = makeWorkingArray(subList)
    if (action.src.subListId !== action.dst.subListId) {
      const target = works[index]
      target.event = eventStore.eventOf(target.issueId)
      target.event.milestoneId = subList.head?.id || 0
    }
    patchIndex(eventStore, works, index)

    for (const issue of subList.items) {
      if (eventStore.eventExists(issue.id)) {
        const ev = eventStore.eventOf(issue.id)
        if (ev.order !== undefined) {
          issue.order = ev.order
        }
        if (ev.milestoneId !== undefined) {
          issue.milestone = subList.head ? [subList.head] : []
        }
      }
    }
  }
  return eventStore.values()
}

const mutateByAddIssue = (data: WritableDraft<PBIList>, created: Issue, orderCustomField: CustomNumberField) => {
  const subList = data.subLists.find((sl) => sl.head?.id === created.milestone[0]?.id)
  if (subList) {
    subList.items.push(withOrder(orderCustomField)(created) as WritableDraft<IssueDataWithOrder>)
  }
}

const mutateByAddMilestone = (data: WritableDraft<PBIList>, created: Version) => {
  data.subLists.push({
    head: created as WritableDraft<Version>,
    items: [],
    id: pbiNestMethods.headId(created)
  })
  data.subLists.sort((sl1, sl2) => pbiNestMethods.headComparator(sl1.head, sl2.head))
}

const mutateByEditMilestone = (data: WritableDraft<PBIList>, updated: Version) => {
  const sIdx = data.subLists.findIndex((sl) => sl.head?.id === updated.id)
  if (sIdx >= 0) {
    data.subLists[sIdx].head = updated as WritableDraft<Version>
  }
  data.subLists.sort((sl1, sl2) => pbiNestMethods.headComparator(sl1.head, sl2.head))
}

const mutateByArchiveMilestone = (data: WritableDraft<PBIList>, archived: Version) => {
  const sIdx = data.subLists.findIndex((sl) => sl.head?.id === archived.id)
  if (sIdx >= 0) {
    data.subLists.splice(sIdx, 1)
  }
}

const getNewOrder = (data: PBIList, milestone: Version | null): number => {
  const subList = data.subLists.find((sl) => sl.head?.id === milestone?.id)
  if (subList && subList.items.length > 0) {
    return (subList.items[subList.items.length - 1].order || 0) + 100
  } else {
    return 0
  }
}

const mutateByEditIssue = (
  data: WritableDraft<PBIList>,
  statuses: ReadonlyArray<Status>,
  issueId: number,
  input: EditIssueInput
) => {
  const item = findIssue(data, issueId)
  if (item) {
    IssueUtil.mutateByIssueInput(item, input, statuses)
  }
}

const findIssue = <T extends PBIList | WritableDraft<PBIList>>(
  data: T,
  issueId: number
): T["subLists"][number]["items"][number] | null => {
  for (const subList of data.subLists) {
    for (const item of subList.items) {
      if (item.id === issueId) {
        return item
      }
    }
  }
  return null
}

const findIssuesInMilestone = (data: PBIList, milestoneId: number): ReadonlyArray<Issue> => {
  const sub = data.subLists.find((sl) => sl.head?.id === milestoneId)
  return sub ? sub.items : []
}

export const PBIListFunc = {
  mutateByEditIssue,
  mutateByMove,
  mutateByAddIssue,
  mutateByAddMilestone,
  mutateByEditMilestone,
  mutateByArchiveMilestone,
  getNewOrder,
  findIssue,
  findIssuesInMilestone,
  nest,
  nestIssues
}
