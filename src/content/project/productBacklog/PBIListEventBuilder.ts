import { MoveAction, NestedListAction } from "./NestedList"
import { PBIListData } from "./PBIList"
import { PBIListChangeEvent } from "./ViewModel"

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
  const lo = left?.order || 0
  const ro = right?.order || 0
  const to = () => target.order || 0
  if (left && right) {
    if (to() <= lo || to() >= ro) {
      if (lo + 2 < ro) {
        setOrder(Math.floor((lo + ro) / 2))
      } else {
        setOrder(lo + 100)
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
    setOrder(ro - 100)
  } else if (left && !right) {
    setOrder(lo + 100)
  }
}

const moved = (pbiList: PBIListData, action: MoveAction): PBIListChangeEvent[] => {
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

const build = (pbiList: PBIListData, action: NestedListAction): PBIListChangeEvent[] => {
  if (action.id === "Move") {
    return moved(pbiList, action)
  } else {
    return []
  }
}

export const PBIListEventBuilder = {
  build
}
