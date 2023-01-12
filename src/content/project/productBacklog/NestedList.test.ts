import { NestedList } from "./NestedList"

const R = NestedList.TEST

type TestHead = {
  readonly headId: string
}
type TestItem = {
  readonly itemId: string
}
const heads: ReadonlyArray<TestHead> = new Array(3).fill("").map((_, i) => ({ headId: `h${i}` }))
const items: ReadonlyArray<TestItem> = new Array(10).fill("").map((_, i) => ({ itemId: `i${i}` }))
type TestState = NestedList.List<TestHead, TestItem>

test("NestedList.move moves an item from a subList to another", () => {
  const prev: TestState = {
    subLists: [
      {
        head: heads[0],
        id: heads[0].headId,
        items: [items[0], items[1], items[2], items[3]]
      },
      {
        head: heads[1],
        id: heads[1].headId,
        items: [items[4], items[5], items[6]]
      }
    ]
  }
  const action: NestedList.Action = NestedList.Move([heads[0].headId, 1], [heads[1].headId, 0])
  expect<TestState>(R.moved(prev, action)).toStrictEqual<TestState>({
    subLists: [
      {
        head: heads[0],
        id: heads[0].headId,
        items: [items[0], items[2], items[3]]
      },
      {
        head: heads[1],
        id: heads[1].headId,
        items: [items[1], items[4], items[5], items[6]]
      }
    ]
  })
})

test("NestedList.move moves an item in a subList", () => {
  const prev: TestState = {
    subLists: [
      {
        head: heads[0],
        id: heads[0].headId,
        items: [items[0], items[1], items[2], items[3]]
      },
      {
        head: heads[1],
        id: heads[1].headId,
        items: [items[4], items[5], items[6]]
      }
    ]
  }
  const action: NestedList.Action = NestedList.Move([heads[0].headId, 1], [heads[0].headId, 0])
  expect<TestState>(R.moved(prev, action)).toStrictEqual<TestState>({
    subLists: [
      {
        head: heads[0],
        id: heads[0].headId,
        items: [items[1], items[0], items[2], items[3]]
      },
      {
        head: heads[1],
        id: heads[1].headId,
        items: [items[4], items[5], items[6]]
      }
    ]
  })
})

test("NestedList.move moves an item in a subList to the end", () => {
  const prev: TestState = {
    subLists: [
      {
        head: heads[0],
        id: heads[0].headId,
        items: [items[0], items[1], items[2], items[3]]
      },
      {
        head: heads[1],
        id: heads[1].headId,
        items: [items[4], items[5], items[6]]
      }
    ]
  }
  const action: NestedList.Action = NestedList.Move([heads[0].headId, 1], [heads[0].headId, 3])
  expect<TestState>(R.moved(prev, action)).toStrictEqual<TestState>({
    subLists: [
      {
        head: heads[0],
        id: heads[0].headId,
        items: [items[0], items[2], items[3], items[1]]
      },
      {
        head: heads[1],
        id: heads[1].headId,
        items: [items[4], items[5], items[6]]
      }
    ]
  })
})

test("NestedList.nest makes a NestedList from an Array", () => {
  type Item = { head: TestHead | null; item: TestItem }
  const orig: Item[] = [
    { head: heads[0], item: items[0] },
    { head: heads[1], item: items[1] },
    { head: null, item: items[2] },
    { head: heads[0], item: items[3] },
    { head: heads[1], item: items[4] },
    { head: null, item: items[5] }
  ]
  const nested = NestedList.nest<TestHead, Item>(orig, {
    itemToHead: (item) => item.head,
    headId: (head: TestHead) => head.headId,
    sortKey: (head) => (head ? parseInt(head.headId.substring(1)) : Number.MAX_VALUE)
  })
  expect(nested).toStrictEqual<NestedList.List<TestHead, Item>>({
    subLists: [
      {
        id: "h0",
        head: { headId: "h0" },
        items: [
          { head: { headId: "h0" }, item: { itemId: "i0" } },
          { head: { headId: "h0" }, item: { itemId: "i3" } }
        ]
      },
      {
        id: "h1",
        head: { headId: "h1" },
        items: [
          { head: { headId: "h1" }, item: { itemId: "i1" } },
          { head: { headId: "h1" }, item: { itemId: "i4" } }
        ]
      },
      {
        id: "",
        head: null,
        items: [
          { head: null, item: { itemId: "i2" } },
          { head: null, item: { itemId: "i5" } }
        ]
      }
    ]
  })
})
