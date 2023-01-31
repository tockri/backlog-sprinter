import { WritableDraft } from "immer/dist/types/types-external"
import { atom, Atom } from "jotai"

export type ImmerAtomSetter<T> = (draft: (update: WritableDraft<T>) => void) => void

export type ValueOrUpdater<U> = U | ((prev: U) => U | Promise<U>)

const isValue = <U>(update: ValueOrUpdater<U>): update is U => typeof update !== "function"

const atomFromParent = <T, U>(parentAtom: Atom<Promise<T>>, relation: (t: T) => U) => {
  const store = atom<U | null>(null)
  return atom<U, ValueOrUpdater<U>>(
    (get) => get(store) || relation(get(parentAtom)),
    async (get, set, update) => {
      const newValue = isValue(update) ? update : await update(get(store) || relation(get(parentAtom)))
      set(store, newValue)
    }
  )
}

export const JotaiUtil = {
  isValue,
  atomFromParent
}
