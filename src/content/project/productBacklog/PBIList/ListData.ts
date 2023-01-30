import { WritableDraft } from "immer/dist/internal"
import { NestedList, NestedListData, NestMethods, NLMoveAction } from "../../../../util/NestedList"
import { IssueChangeInput, IssueData, IssueDataUtil } from "../../../backlog/Issue"
import { CustomNumberField, Status, Version } from "../../../backlog/ProjectInfo"

export type IssueDataWithOrder = IssueData & { readonly order: number | null }
export type PBIListData = NestedListData<Version, IssueDataWithOrder>

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

const nest = (items: ReadonlyArray<IssueDataWithOrder>): PBIListData => {
  return NestedList.nest<Version, IssueDataWithOrder>(items, pbiNestMethods)
}

const nestIssues = (issues: ReadonlyArray<IssueData>, orderCustomField: CustomNumberField): PBIListData =>
  nest(issues.map(withOrder(orderCustomField)))

const withOrder =
  (orderCustomField: CustomNumberField) =>
  (issue: IssueData): IssueDataWithOrder => ({ ...issue, order: getOrderValue(orderCustomField, issue) })

const getOrderValue = (orderCustomField: CustomNumberField, issue: IssueData): number | null => {
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

type PBISubList = PBIListData["subLists"][number]

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

const mutateByMoveAction = (data: WritableDraft<PBIListData>, action: NLMoveAction): PBIListMovedEvent[] => {
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

const mutateByIssueCreation = (
  data: WritableDraft<PBIListData>,
  created: IssueData,
  orderCustomField: CustomNumberField
) => {
  const subList = data.subLists.find((sl) => sl.head?.id === created.milestone[0]?.id)
  if (subList) {
    subList.items.push(withOrder(orderCustomField)(created) as WritableDraft<IssueDataWithOrder>)
  }
}

export type PBIChangeAction = {
  issueId: number
  input: IssueChangeInput
}

const getNewOrder = (data: PBIListData, milestone: Version | null): number => {
  const subList = data.subLists.find((sl) => sl.head?.id === milestone?.id)
  if (subList) {
    const newValue = (subList.items[subList.items.length - 1].order || 0) + 100
    console.log({
      orders: subList.items.map((it) => it.order),
      newValue
    })
    return newValue
  } else {
    return 0
  }
}

const mutateByChangeAction = (
  data: WritableDraft<PBIListData>,
  statuses: ReadonlyArray<Status>,
  action: PBIChangeAction
) => {
  const { issueId, input } = action
  const [item] = findIssue(data, issueId)
  if (item) {
    IssueDataUtil.mutateByIssueInput(item, input, statuses)
  }
}

const findIssue = <T extends PBIListData | WritableDraft<PBIListData>>(
  data: T,
  issueId: number
): [T["subLists"][number]["items"][number], T["subLists"][number]["head"]] | [null, null] => {
  for (const subList of data.subLists) {
    for (const item of subList.items) {
      if (item.id === issueId) {
        return [item, subList.head]
      }
    }
  }
  return [null, null]
}

export const PBIListDataHandler = {
  mutateByChangeAction,
  mutateByMoveAction,
  mutateByIssueCreation,
  getNewOrder,
  findIssue,
  nest,
  nestIssues
}
