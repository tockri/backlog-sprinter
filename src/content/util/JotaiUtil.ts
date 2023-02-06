import { WritableDraft } from "immer/dist/internal"
import { atom, Atom } from "jotai"
import { WritableAtom } from "jotai/core/atom"

type ValueOrUpdater<U> = U | ((prev: U) => U | Promise<U>)
export type ImmerAtomSetter<T> = (draft: (update: WritableDraft<T>) => void) => void

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

// Copied from jotai/core/atom.d.ts
export type Getter = {
  <Value>(atom: Atom<Value | Promise<Value>>): Value
  <Value>(atom: Atom<Promise<Value>>): Value
  <Value>(atom: Atom<Value>): Awaited<Value>
}
// Copied from jotai/core/atom.d.ts
export type WriteGetter = Getter & {
  <Value>(
    atom: Atom<Value | Promise<Value>>,
    options: {
      unstable_promise: true
    }
  ): Promise<Value> | Value
  <Value>(
    atom: Atom<Promise<Value>>,
    options: {
      unstable_promise: true
    }
  ): Promise<Value> | Value
  <Value>(
    atom: Atom<Value>,
    options: {
      unstable_promise: true
    }
  ): Promise<Awaited<Value>> | Awaited<Value>
}
// Copied from jotai/core/atom.d.ts
export type Setter = {
  <Value, Result extends void | Promise<void>>(atom: WritableAtom<Value, undefined, Result>): Result
  <Value, Update, Result extends void | Promise<void>>(
    atom: WritableAtom<Value, Update, Result>,
    update: Update
  ): Result
}
// Copied from jotai/core/atom.d.ts
export type Write<Update, Result extends void | Promise<void> = Promise<void>> = (
  get: WriteGetter,
  set: Setter,
  update: Update
) => Result
