// noinspection JSUnusedGlobalSymbols

import { WritableDraft } from "immer/dist/internal"

import { atom, Atom, Getter, Setter } from "jotai"

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
export type Read<Value> = (get: Getter) => Value

// Copied from jotai/core/atom.d.ts
export type Write<Update, Result extends void | Promise<void> = Promise<void>> = (
  get: WriteGetter,
  set: Setter,
  update: Update
) => Result

export type ImmerAtomSetter<T> = (draft: (update: WritableDraft<T>) => void) => void

export type ValueOrUpdater<U> = U | ((prev: U) => U | Promise<U>)

const isValue = <U>(update: ValueOrUpdater<U>): update is U => typeof update !== "function"

const atomFromParent = <T, U>(parentAtom: Atom<Promise<T>>, relation: (t: T) => U) => {
  const store = atom<U | null>(null)
  const main = atom<Promise<U>, [U], void>(
    async (get: Getter) => get(store) || relation(await get(parentAtom)),
    async (get: WriteGetter, set: Setter, update: ValueOrUpdater<U>) => {
      const prev = await get(main)
      const newValue = isValue(update) ? update : await update(prev)
      set(store, newValue)
    }
  )
  return main
}

export type AsyncRead<Value> = (get: Getter) => Promise<Value>
export type Handler<Value, Action> = (
  curr: Value,
  get: WriteGetter,
  set: Setter,
  action: Action
) => Value | Promise<Value>

const asyncAtomWithAction = <Value, Action>(read: AsyncRead<Value>, handler: Handler<Value, Action>) => {
  const store = atom<Value | null>(null)
  const main = atom<Promise<Value>, [Action], void | Promise<void>>(
    async (get) => {
      const stored = get(store)
      if (stored !== null) {
        return stored
      } else {
        return await read(get)
      }
    },
    async (get: WriteGetter, set: Setter, action: Action) => {
      const curr = await get(main)
      if (curr !== null) {
        const updated = handler(curr, get, set, action)
        if (updated instanceof Promise) {
          return updated.then((up) => set(store, up))
        } else {
          return set(store, updated)
        }
      }
    }
  )
  return main
}

export const JotaiUtil = {
  isValue,
  atomFromParent,
  asyncAtomWithAction
}
