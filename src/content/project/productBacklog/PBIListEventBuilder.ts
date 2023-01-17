import { Version } from "../../backlog/ProjectInfo"
import { MoveAction, NestedListAction, NestMethods } from "./NestedList"
import { IssueDataWithOrder, PBIListData } from "./PBIList"
import { PBIListChangeEvent } from "./ViewModel"

class EventStore {
  private readonly events = new Map<number, PBIListChangeEvent>()
  eventOf(issueId: number): PBIListChangeEvent {
    let ev = this.events.get(issueId)
    if (!ev) {
      ev = { issueId: issueId }
      this.events.set(issueId, ev)
    }
    return ev
  }
  values(): PBIListChangeEvent[] {
    return Array.from(this.events.values())
  }
}

const moved = (
  pbiList: PBIListData,
  action: MoveAction,
  methods: NestMethods<Version, IssueDataWithOrder>
): PBIListChangeEvent[] => {
  const events = new EventStore()
  const subList = pbiList.subLists.find((sl) => sl.id === action.destination.subListId)
  if (subList) {
    const index = action.destination.index
    type Work = {
      readonly issueId: number
      order: number
      event: PBIListChangeEvent | null
    }
    const works = subList.items.map(
      (item): Work => ({
        issueId: item.id,
        order: item.order || 0,
        event: null
      })
    )
    const tgt = works[index]
    tgt.event = events.eventOf(tgt.issueId)
    tgt.event.milestoneId = subList.head?.id

    for (let left = index - 1; left >= 0; left--) {
      const l = works[left]
      if (l.order < works[left + 1].order - 2) {
        break
      } else {
        l.order = works[left + 1].order - 100
      }
    }
  }
  return events.values()
}

const build = (
  pbiList: PBIListData,
  action: NestedListAction,
  methods: NestMethods<Version, IssueDataWithOrder>
): PBIListChangeEvent[] => {
  if (action.id === "Move") {
    return moved(pbiList, action, methods)
  } else {
    return []
  }
}

export const PBIListEventBuilder = {
  build
}
