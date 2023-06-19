import { produce } from "immer"
import { ArrayUtil } from "../../../../util/ArrayUtil"
import { NestedList, NLLocation, NLMoveAction } from "../../../../util/NestedList"
import { IssueTypeColor, Version } from "../../../backlog/ProjectInfoApi"
import { IssueDataWithOrder, PBIList, PBIListFunc, PBIListMovedEvent } from "./PBIList"

// -------------------- preparation --------------------------

const fakeVersion = (id: number): Version => ({
  id,
  name: `MS ${id}`,
  projectId: 1,
  description: "",
  startDate: `2023-01-${id} 00:00:00Z`,
  releaseDueDate: `2023-01-${id + 10} 00:00:00Z`,
  archived: false,
  displayOrder: id
})
const versions: Record<number, Version> = [1, 2, 3].reduce((acc, id) => {
  acc[id] = fakeVersion(id)
  return acc
}, {} as Record<number, Version>)
const fakeIssue = (id: number, versionId: number | null, order: number | null): IssueDataWithOrder => ({
  id,
  projectId: 1,
  issueKey: `FAKE-${id}`,
  keyId: id,
  summary: `Issue ${id}`,
  description: "",
  status: { id: 1, projectId: 1, name: "Open", color: "#ff0000", displayOrder: 10 },
  milestone: versionId ? [versions[versionId]] : [],
  customFields: [],
  estimatedHours: null,
  actualHours: null,
  parentIssueId: null,
  issueType: {
    id: 2,
    color: IssueTypeColor.pill__issue_type_1,
    name: "test type",
    projectId: 1,
    displayOrder: 1000
  },
  order
})
const makeFakeBacklog = (
  ...data: ReadonlyArray<[id: number, versionId: number | null, order: number | null]>
): Record<number, IssueDataWithOrder> =>
  ArrayUtil.toRecord(
    data.map((args) => fakeIssue(...args)),
    (issue) => issue.id
  )

const issues = makeFakeBacklog(
  [1, 1, 100],
  [3, 1, 300],
  [2, 1, 200],
  [5, 2, 800],
  [4, 1, 400],
  [6, 2, 900],
  [7, 3, null],
  [8, 3, null],
  [9, 3, null],
  [10, 3, null],
  [11, 0, null],
  [13, 0, 51],
  [12, 0, null],
  [14, 0, 52]
)
const nested = PBIListFunc.nest(Object.values(issues))
const toLoc = (subListId: string, index: number): NLLocation => ({ subListId, index })
const toAction = (src: [subListId: string, index: number], dst: [subListId: string, index: number]): NLMoveAction => ({
  type: "NLMove",
  src: toLoc(src[0], src[1]),
  dst: toLoc(dst[0], dst[1])
})

// ------------------- /preparation --------------------------
test("preparations are correct", () => {
  expect(nested).toStrictEqual<PBIList>({
    subLists: [
      {
        id: "1",
        head: versions[1],
        items: [issues[1], issues[2], issues[3], issues[4]]
      },
      {
        id: "2",
        head: versions[2],
        items: [issues[5], issues[6]]
      },
      {
        id: "3",
        head: versions[3],
        items: [issues[7], issues[8], issues[9], issues[10]]
      },
      {
        id: "--",
        head: null,
        items: [issues[11], issues[12], issues[13], issues[14]]
      }
    ]
  })

  const updated = NestedList.move(nested, toAction(["1", 2], ["2", 0]))
  expect(updated).toStrictEqual<PBIList>({
    subLists: [
      {
        id: "1",
        head: versions[1],
        items: [issues[1], issues[2], issues[4]]
      },
      {
        id: "2",
        head: versions[2],
        items: [issues[3], issues[5], issues[6]]
      },
      {
        id: "3",
        head: versions[3],
        items: [issues[7], issues[8], issues[9], issues[10]]
      },
      {
        id: "--",
        head: null,
        items: [issues[11], issues[12], issues[13], issues[14]]
      }
    ]
  })
})

test("Move to the top of another subList", () => {
  const action = toAction(["1", 2], ["2", 0])
  let events: PBIListMovedEvent[] = []
  produce(nested, (draft) => {
    events = PBIListFunc.mutateByMove(draft, action)
  })
  expect(events).toStrictEqual<PBIListMovedEvent[]>([
    {
      issueId: 3,
      milestoneId: 2,
      order: 700
    }
  ])
})

test("Move to the inside of another subList", () => {
  const action = toAction(["1", 2], ["2", 1])
  let events: PBIListMovedEvent[] = []
  produce(nested, (draft) => {
    events = PBIListFunc.mutateByMove(draft, action)
  })

  expect(events).toStrictEqual<PBIListMovedEvent[]>([
    {
      issueId: 3,
      milestoneId: 2,
      order: 850
    }
  ])
})

test("Move within a subList", () => {
  const action = toAction(["1", 2], ["1", 0])
  let events: PBIListMovedEvent[] = []
  produce(nested, (draft) => {
    events = PBIListFunc.mutateByMove(draft, action)
  })
  expect(events).toStrictEqual<PBIListMovedEvent[]>([
    {
      issueId: 3,
      order: 0
    }
  ])
})

test("Move to the last", () => {
  const action = toAction(["1", 2], ["1", 4])
  let events: PBIListMovedEvent[] = []
  produce(nested, (draft) => {
    events = PBIListFunc.mutateByMove(draft, action)
  })
  expect(events).toStrictEqual<PBIListMovedEvent[]>([
    {
      issueId: 3,
      order: 500
    }
  ])
})

test("Move and cause infection", () => {
  const action = toAction(["1", 2], ["3", 1])
  let events: PBIListMovedEvent[] = []
  produce(nested, (draft) => {
    events = PBIListFunc.mutateByMove(draft, action)
  })
  expect(Array.from(events).sort((e1, e2) => e1.issueId - e2.issueId)).toStrictEqual<PBIListMovedEvent[]>([
    {
      issueId: 3,
      milestoneId: 3,
      order: 30
    },
    {
      issueId: 7,
      order: -70
    },
    {
      issueId: 8,
      order: 60
    },
    {
      issueId: 9,
      order: 90
    },
    {
      issueId: 10,
      order: 190
    }
  ])
})

test("Move and make order between null and some", () => {
  const action = toAction(["1", 2], ["--", 1])
  let events: PBIListMovedEvent[] = []
  produce(nested, (draft) => {
    events = PBIListFunc.mutateByMove(draft, action)
  })
  expect(Array.from(events).sort((e1, e2) => e1.issueId - e2.issueId)).toStrictEqual<PBIListMovedEvent[]>([
    {
      issueId: 3,
      milestoneId: 0,
      order: 30
    },
    {
      issueId: 11,
      order: -70
    },
    {
      issueId: 12,
      order: 40
    }
  ])
})

test("Move and cause infection on existing issues", () => {
  const action = toAction(["1", 2], ["--", 2])
  let events: PBIListMovedEvent[] = []
  produce(nested, (draft) => {
    events = PBIListFunc.mutateByMove(draft, action)
  })
  expect(events.sort((e1, e2) => e1.issueId - e2.issueId)).toStrictEqual<PBIListMovedEvent[]>([
    {
      issueId: 3,
      milestoneId: 0,
      order: 25
    },
    {
      issueId: 11,
      order: -88
    },
    {
      issueId: 12,
      order: 12
    }
  ])
})
