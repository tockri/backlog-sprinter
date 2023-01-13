type SubList<H, T> = {
  readonly id: string
  readonly head: H | null
  readonly items: ReadonlyArray<T>
}

type List<H, T> = {
  readonly subLists: ReadonlyArray<SubList<H, T>>
}

const nest = <H, T>(
  list: ReadonlyArray<T>,
  callbacks: {
    itemToHead: (item: T) => H | null
    headId: (head: H | null) => string
    sortKey: (head: H | null) => number
  }
): List<H, T> => {
  const store = new Map<string, { id: string; head: H | null; items: T[] }>()
  list.forEach((item) => {
    const head = callbacks.itemToHead(item)
    const id = callbacks.headId(head)
    if (!store.has(id)) {
      store.set(id, { id, head, items: [] })
    }
    store.get(id)?.items.push(item)
  })
  const subLists = Array.from(store.values()).sort((c1, c2) => callbacks.sortKey(c1.head) - callbacks.sortKey(c2.head))
  return { subLists }
}

type NLLocation = {
  readonly subListId: string
  readonly index: number
}

type MoveAction = {
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
    if (action.source.subListId === action.destination.subListId) {
      const subListId = action.source.subListId
      const subList = prev.subLists.find((sl) => sl.id === subListId)
      if (subList) {
        const items = Array.from(subList.items)
        const target = items.splice(action.source.index, 1)
        items.splice(action.destination.index, 0, ...target)
        return {
          subLists: prev.subLists.map((sl) => (sl.id === subListId ? { ...sl, items: items } : sl))
        }
      }
    } else {
      const srcSub = prev.subLists.find((g) => g.id === action.source.subListId)
      const dstSub = prev.subLists.find((g) => g.id === action.destination.subListId)
      if (srcSub && dstSub) {
        const srcItems = Array.from(srcSub.items)
        const target = srcItems.splice(action.source.index, 1)
        const dstItems = Array.from(dstSub.items)
        dstItems.splice(action.destination.index, 0, ...target)
        return {
          subLists: prev.subLists.map((sl) =>
            sl.id === action.source.subListId
              ? {
                  ...sl,
                  items: srcItems
                }
              : sl.id === action.destination.subListId
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
