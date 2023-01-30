import { Immutable, produce } from "immer"
import { WritableDraft } from "immer/dist/types/types-external"

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
  itemComparator: (item1: T, item2: T) => number
  headId: (head: H | null) => string
  headComparator: (head1: H | null, head2: H | null) => number
}

const compareNullable = (a: number | null, b: number | null): number => {
  if (a === null && b === null) {
    return 0
  } else if (a === null) {
    return -1
  } else if (b === null) {
    return 1
  } else {
    if (a === b) {
      return 0
    } else {
      return a < b ? -1 : 1
    }
  }
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
  const subLists = Array.from(store.values()).sort((sl1, sl2) => methods.headComparator(sl1.head, sl2.head))
  subLists.forEach((sl) => sl.items.sort(methods.itemComparator))
  return { subLists }
}

export type NLLocation = Immutable<{
  subListId: string
  index: number
}>

export type NLMoveAction = Immutable<{
  type: "NLMove"
  src: NLLocation
  dst: NLLocation
}>

const move = <H, T>(prev: List<H, T>, action: NLMoveAction): List<H, T> => {
  return produce(prev, (draft) => mutateMove(draft, action))
}

const mutateMove = <H, T>(draft: WritableDraft<List<H, T>>, action: NLMoveAction) => {
  const { src, dst } = action
  if (src.subListId === dst.subListId) {
    const subListId = src.subListId
    const subList = draft.subLists.find((sl) => sl.id === subListId)
    if (subList) {
      const target = subList.items.splice(src.index, 1)
      const dstIndex = dst.index < src.index ? dst.index : dst.index - 1
      subList.items.splice(dstIndex, 0, ...target)
    }
  } else {
    const srcSub = draft.subLists.find((g) => g.id === src.subListId)
    const dstSub = draft.subLists.find((g) => g.id === dst.subListId)
    if (srcSub && dstSub) {
      const target = srcSub.items.splice(src.index, 1)
      dstSub.items.splice(dst.index, 0, ...target)
    }
  }
}

export const NestedList = {
  move,
  mutateMove,
  compareNullable,
  nest
}

export type NestedListData<H, T> = List<H, T>
