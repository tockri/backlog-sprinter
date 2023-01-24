import { WritableDraft } from "immer/dist/types/types-external"
import { atom, Atom, Getter, WritableAtom } from "jotai"

export type ImmerAtomSetter<T> = (draft: (update: WritableDraft<T>) => void) => void

export type ValueOrUpdater<U> = U | ((prev: U) => U)

const isValue = <U>(update: ValueOrUpdater<U>): update is U => typeof update !== "function"

const atomFromParent = <T, U>(parentAtom: Atom<Promise<T>>, relation: (t: T) => U) => {
  const store = atom<U | null>(null)
  return atom<U, ValueOrUpdater<U>>(
    (get) => get(store) || relation(get(parentAtom)),
    (get, set, update) => {
      const newValue = isValue(update) ? update : update(get(store) || relation(get(parentAtom)))
      set(store, newValue)
    }
  )
}

type Read<T> = (get: Getter) => Promise<T>
const atomWithAsync = <T>(read: Read<T>): WritableAtom<Promise<T>, ValueOrUpdater<T>> => {
  const store = atom<T | null>(null)
  return atom<Promise<T>, ValueOrUpdater<T>>(
    (get) => read(get),
    async (get, set, update) => {
      if (isValue(update)) {
        set(store, update)
      } else {
        set(store, update(get(store) || (await read(get))))
      }
    }
  )
}

export const JotaiUtil = {
  isValue,
  atomFromParent,
  atomWithAsync
}
