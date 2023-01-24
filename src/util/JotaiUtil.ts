import { atom, Atom, WritableAtom } from "jotai"

const makeChildAtom = <T, U>(parentAtom: Atom<Promise<T>>, relation: (t: T) => U): WritableAtom<U, U> => {
  const store = atom<U | null>(null)
  return atom<U, U>(
    (get) => get(store) || relation(get(parentAtom)),
    (get, set, value) => {
      set(store, value)
    }
  )
}

export const JotaiUtil = {
  makeChildAtom
}
