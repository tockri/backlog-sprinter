import { NestedList, NestedListAction, NestedListData } from "./NestedList"

const R = NestedList.FOR_TEST_ONLY

type TestHead = {
  readonly headId: string
}
type TestItem = {
  readonly itemId: string
  readonly order: number
}
const heads: ReadonlyArray<TestHead> = new Array(3).fill("").map((_, i) => ({ headId: `h${i}` }))
const items: ReadonlyArray<TestItem> = new Array(10).fill("").map((_, i) => ({ itemId: `i${i}`, order: 0 }))
type TestState = NestedListData<TestHead, TestItem>

const origData: TestState = {
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
    },
    {
      head: null,
      id: "--",
      items: [items[7]]
    }
  ]
}

test("NestedList.move moves an item from a subList to another", () => {
  const action: NestedListAction = NestedList.Move([heads[0].headId, 1], [heads[1].headId, 0])
  expect<TestState>(R.moved(origData, action)).toStrictEqual<TestState>({
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
      },
      {
        head: null,
        id: "--",
        items: [items[7]]
      }
    ]
  })
})

test("NestedList.move moves an item from a subList to another subList with empty head", () => {
  expect<TestState>(R.moved(origData, NestedList.Move([heads[0].headId, 1], ["--", 2]))).toStrictEqual<TestState>({
    subLists: [
      {
        head: heads[0],
        id: heads[0].headId,
        items: [items[0], items[2], items[3]]
      },
      {
        head: heads[1],
        id: heads[1].headId,
        items: [items[4], items[5], items[6]]
      },
      {
        head: null,
        id: "--",
        items: [items[7], items[1]]
      }
    ]
  })
})

test("NestedList.move moves an item from a subList with empty head to another subList", () => {
  expect<TestState>(R.moved(origData, NestedList.Move(["--", 0], [heads[0].headId, 3]))).toStrictEqual<TestState>({
    subLists: [
      {
        head: heads[0],
        id: heads[0].headId,
        items: [items[0], items[1], items[2], items[7], items[3]]
      },
      {
        head: heads[1],
        id: heads[1].headId,
        items: [items[4], items[5], items[6]]
      },
      {
        head: null,
        id: "--",
        items: []
      }
    ]
  })
})

test("NestedList.move moves an item to the top in a subList", () => {
  const action: NestedListAction = NestedList.Move([heads[0].headId, 1], [heads[0].headId, 0])
  expect<TestState>(R.moved(origData, action)).toStrictEqual<TestState>({
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
      },
      {
        head: null,
        id: "--",
        items: [items[7]]
      }
    ]
  })
})

test("NestedList.move moves an item to the last in a subList", () => {
  const action: NestedListAction = NestedList.Move([heads[0].headId, 1], [heads[0].headId, 4])
  expect<TestState>(R.moved(origData, action)).toStrictEqual<TestState>({
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
      },
      {
        head: null,
        id: "--",
        items: [items[7]]
      }
    ]
  })
})

test("NestedList.move moves an item in a subList to the end", () => {
  const action: NestedListAction = NestedList.Move([heads[0].headId, 1], [heads[0].headId, 4])
  expect<TestState>(R.moved(origData, action)).toStrictEqual<TestState>({
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
      },
      {
        head: null,
        id: "--",
        items: [items[7]]
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
    itemSortKey: (item) => item.item.order,
    headId: (head: TestHead | null) => (head ? head.headId : ""),
    headSortKey: (head) => (head ? parseInt(head.headId.substring(1)) : Number.MAX_VALUE)
  })
  expect(nested).toStrictEqual<NestedListData<TestHead, Item>>({
    subLists: [
      {
        id: "h0",
        head: heads[0],
        items: [
          { head: heads[0], item: items[0] },
          { head: heads[0], item: items[3] }
        ]
      },
      {
        id: "h1",
        head: heads[1],
        items: [
          { head: heads[1], item: items[1] },
          { head: heads[1], item: items[4] }
        ]
      },
      {
        id: "",
        head: null,
        items: [
          { head: null, item: items[2] },
          { head: null, item: items[5] }
        ]
      }
    ]
  })
})
