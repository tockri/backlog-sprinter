import { Version } from "../../backlog/ProjectInfo"
import { NestedList, NestMethods } from "./NestedList"
import { IssueDataWithOrder, PBIListData } from "./PBIList"
import { PBIListEventBuilder } from "./PBIListEventBuilder"
import { PBIListChangeEvent } from "./ViewModel"

test("Builder.move makes events", () => {
  const issues = makeFakeBacklog(
    [1, 1, 100],
    [2, 1, 200],
    [3, 1, 300],
    [4, 1, 400],
    [5, 2, 800],
    [6, 2, 900],
    [7, 0, 1000],
    [8, 0, 1100]
  )
  const nested = NestedList.nest(
    Object.values(issues).sort((i1, i2) => (i1.order || 0) - (i2.order || 0)),
    pbiNestMethods
  )
  expect(nested).toStrictEqual<PBIListData>({
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
        id: "--",
        head: null,
        items: [issues[7], issues[8]]
      }
    ]
  })

  const action = NestedList.Move(["1", 2], ["2", 0])
  const updated = NestedList.reducer(nested, action)
  expect(updated).toStrictEqual<PBIListData>({
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
        id: "--",
        head: null,
        items: [issues[7], issues[8]]
      }
    ]
  })
  const events = PBIListEventBuilder.build(updated, action, pbiNestMethods)
  expect(events).toStrictEqual<PBIListChangeEvent[]>([
    {
      issueId: 3,
      milestoneId: 2,
      order: 700
    }
  ])
})

const pbiNestMethods: NestMethods<Version, IssueDataWithOrder> = {
  itemToHead: (item) => item.milestone.find((m) => m.startDate && m.releaseDueDate) || null,
  headId: (head) => (head ? "" + head.id : "--"),
  sortKey: (head) => (head && head.releaseDueDate ? Date.parse(head.releaseDueDate) : Number.MAX_VALUE)
}
const fakeVersion = (id: number): Version => ({
  id,
  name: `MS ${id}`,
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
  issueKey: `FAKE-${id}`,
  summary: `Issue ${id}`,
  status: { id: 1, name: "Open", color: "#ff0000" },
  milestone: versionId ? [versions[versionId]] : [],
  customFields: [],
  order
})
const makeFakeBacklog = (
  ...data: ReadonlyArray<[id: number, versionId: number | null, order: number | null]>
): Record<number, IssueDataWithOrder> =>
  data.reduce((acc, [id, versionId, order]) => {
    acc[id] = fakeIssue(id, versionId, order)
    return acc
  }, {} as Record<number, IssueDataWithOrder>)
