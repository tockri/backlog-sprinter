type SubList<H, T> = {
  readonly id: string
  readonly head: H | null
  readonly items: ReadonlyArray<T>
}

type List<H, T> = {
  readonly subLists: ReadonlyArray<SubList<H, T>>
}

export type NestMethods<H, T> = {
  itemToHead: (item: T) => H | null
  itemSortKey: (item: T) => number
  headId: (head: H | null) => string
  headSortKey: (head: H | null) => number
}

const nest = <H, T>(list: ReadonlyArray<T>, methods: NestMethods<H, T>): List<H, T> => {
  const store = new Map<string, { id: string; head: H | null; items: T[] }>()
  list.forEach((item) => {
    const head = methods.itemToHead(item)
    const id = methods.headId(head)
    if (!store.has(id)) {
      store.set(id, { id, head, items: [] })
    }
    store.get(id)?.items.push(item)
  })
  const subLists = Array.from(store.values()).sort(
    (c1, c2) => methods.headSortKey(c1.head) - methods.headSortKey(c2.head)
  )
  subLists.forEach((sl) => sl.items.sort((i1, i2) => methods.itemSortKey(i1) - methods.itemSortKey(i2)))
  return { subLists }
}

type NLLocation = {
  readonly subListId: string
  readonly index: number
}

export type MoveAction = {
  readonly id: "Move"
  readonly source: NLLocation
  readonly destination: NLLocation
}

const toLocation = (arg: readonly [subListId: string, index: number]): NLLocation => ({
  subListId: arg[0],
  index: arg[1]
})

const Move = (
  source: readonly [subListId: string, index: number],
  destination: readonly [subListId: string, index: number]
): MoveAction => ({
  id: "Move",
  source: toLocation(source),
  destination: toLocation(destination)
})

type Action = MoveAction

const moved = <H, T>(prev: List<H, T>, action: Action): List<H, T> => {
  if (action.id === "Move") {
    const src = action.source
    const dst = action.destination
    if (src.subListId === dst.subListId) {
      const subListId = src.subListId
      const subList = prev.subLists.find((sl) => sl.id === subListId)
      if (subList) {
        const items = Array.from(subList.items)
        const target = items.splice(src.index, 1)
        const dstIndex = dst.index < src.index ? dst.index : dst.index - 1
        items.splice(dstIndex, 0, ...target)
        return {
          subLists: prev.subLists.map((sl) => (sl.id === subListId ? { ...sl, items: items } : sl))
        }
      }
    } else {
      const srcSub = prev.subLists.find((g) => g.id === src.subListId)
      const dstSub = prev.subLists.find((g) => g.id === dst.subListId)
      if (srcSub && dstSub) {
        const srcItems = Array.from(srcSub.items)
        const target = srcItems.splice(src.index, 1)
        const dstItems = Array.from(dstSub.items)
        dstItems.splice(dst.index, 0, ...target)
        return {
          subLists: prev.subLists.map((sl) =>
            sl.id === src.subListId
              ? {
                  ...sl,
                  items: srcItems
                }
              : sl.id === dst.subListId
              ? {
                  ...sl,
                  items: dstItems
                }
              : sl
          )
        }
      }
    }
  }
  return prev
}

const FOR_TEST_ONLY = {
  moved
}

const reducer = moved

export const NestedList = {
  FOR_TEST_ONLY,
  reducer,
  nest,
  Move
}

export type NestedListData<H, T> = List<H, T>

export type NestedListAction = Action
