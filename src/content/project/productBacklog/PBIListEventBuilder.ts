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
    type Work = {
      issueId: number
      order: number | null
      event: PBIListChangeEvent | null
    }
    const works = subList.items.map(
      (item): Work => ({
        issueId: item.id,
        order: item.order,
        event: null
      })
    )
    const tgt = subList.items[action.destination.index]
    const ev = events.eventOf(tgt.id)
    ev.milestoneId = subList.head?.id
    ev.order = 700
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
