import { MoveAction, NestedList, NestedListAction, NestedListData, NestMethods } from "../../../../util/NestedList"
import { IssueData } from "../../../backlog/Issue"
import { Version } from "../../../backlog/ProjectInfo"

export type IssueDataWithOrder = IssueData & { readonly order: number | null }
export type PBIListData = NestedListData<Version, IssueDataWithOrder>

export type PBIListChangeEvent = {
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

class EventStore {
  private readonly events: Record<number, PBIListChangeEvent> = {}
  eventOf(issueId: number): PBIListChangeEvent {
    if (!this.events[issueId]) {
      this.events[issueId] = { issueId }
    }
    return this.events[issueId]
  }
  values(): PBIListChangeEvent[] {
    return Object.values(this.events)
  }
}

type PBISubList = PBIListData["subLists"][number]

type Work = {
  readonly issueId: number
  order: number | null
  event: PBIListChangeEvent | null
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

const buildMovedEvents = (pbiList: PBIListData, action: MoveAction): PBIListChangeEvent[] => {
  const eventStore = new EventStore()
  const subList = pbiList.subLists.find((sl) => sl.id === action.destination.subListId)
  if (subList) {
    const index =
      action.source.subListId === action.destination.subListId && action.source.index < action.destination.index
        ? action.destination.index - 1
        : action.destination.index
    const works = makeWorkingArray(subList)
    if (action.source.subListId !== action.destination.subListId) {
      const target = works[index]
      target.event = eventStore.eventOf(target.issueId)
      target.event.milestoneId = subList.head?.id || 0
    }
    patchIndex(eventStore, works, index)
  }
  return eventStore.values()
}

const buildEvent = (pbiList: PBIListData, action: NestedListAction): PBIListChangeEvent[] => {
  if (action.id === "Move") {
    return buildMovedEvents(pbiList, action)
  } else {
    return []
  }
}

export const PBIListDataHandler = {
  buildEvent,
  nest
}
