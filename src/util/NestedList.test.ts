import { NestedList, NestedListData, NLLocation, NLMoveAction } from "./NestedList"

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

const toLoc = (subListId: string, index: number): NLLocation => ({ subListId, index })
const toAction = (src: [subListId: string, index: number], dst: [subListId: string, index: number]): NLMoveAction => ({
  type: "NLMove",
  src: toLoc(src[0], src[1]),
  dst: toLoc(dst[0], dst[1])
})

test("NestedList.move moves an item from a subList to another", () => {
  expect<TestState>(
    NestedList.move(origData, toAction([heads[0].headId, 1], [heads[1].headId, 0]))
  ).toStrictEqual<TestState>({
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
  expect<TestState>(NestedList.move(origData, toAction([heads[0].headId, 1], ["--", 2]))).toStrictEqual<TestState>({
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
  expect<TestState>(NestedList.move(origData, toAction(["--", 0], [heads[0].headId, 3]))).toStrictEqual<TestState>({
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
  expect<TestState>(
    NestedList.move(origData, toAction([heads[0].headId, 1], [heads[0].headId, 0]))
  ).toStrictEqual<TestState>({
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
  expect<TestState>(
    NestedList.move(origData, toAction([heads[0].headId, 1], [heads[0].headId, 4]))
  ).toStrictEqual<TestState>({
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
  type Item = { head: TestHead | null; item: TestItem | null }
  const orig: Item[] = [
    { head: heads[0], item: items[0] },
    { head: heads[1], item: items[1] },
    { head: null, item: items[2] },
    { head: heads[0], item: null },
    { head: heads[1], item: items[4] },
    { head: null, item: items[5] }
  ]
  const itemSortKey = (item: Item) => (item.item !== null ? item.item.order : null)
  const headSortKey = (head: TestHead | null) => (head ? parseInt(head.headId.substring(1)) : Number.MAX_VALUE)

  const nested = NestedList.nest<TestHead, Item>(orig, {
    itemToHead: (item) => item.head,
    itemComparator: (item1, item2) => NestedList.compareNullable(itemSortKey(item1), itemSortKey(item2)),
    headId: (head: TestHead | null) => (head ? head.headId : "--"),
    headComparator: (head1, head2) => NestedList.compareNullable(headSortKey(head1), headSortKey(head2))
  })
  expect(nested).toStrictEqual<NestedListData<TestHead, Item>>({
    subLists: [
      {
        id: "h0",
        head: heads[0],
        items: [
          { head: heads[0], item: null },
          { head: heads[0], item: items[0] }
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
        id: "--",
        head: null,
        items: [
          { head: null, item: items[2] },
          { head: null, item: items[5] }
        ]
      }
    ]
  })
})
