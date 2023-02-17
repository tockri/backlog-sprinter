// noinspection JSUnusedGlobalSymbols

import { atom, Atom, Getter, Setter, WritableAtom } from "jotai"
import { atomFamily } from "jotai/utils"
import { AtomFamily } from "jotai/vanilla/utils/atomFamily"

// Copied from jotai/core/atom.d.ts
export type Read<Value> = (get: Getter) => Value

// Copied from jotai/core/atom.d.ts
export type Write<Args extends unknown[], Result> = (get: Getter, set: Setter, ...args: Args) => Result

export type ValueOrUpdater<U> = U | ((prev: U) => U | Promise<U>)

const isValue = <U>(update: ValueOrUpdater<U>): update is U => typeof update !== "function"

const asyncAtomFromParent = <T, U>(
  parentAtom: Atom<Promise<T>>,
  relation: (t: T) => U
): WritableAtom<Promise<U>, [ValueOrUpdater<U>], Promise<void>> => {
  const store = atom<U | null>(null)
  const main = atom<Promise<U>, [ValueOrUpdater<U>], Promise<void>>(
    async (get) => get(store) || relation(await get(parentAtom)),
    async (get, set, update) => {
      set(store, isValue(update) ? update : await update(await get(main)))
    }
  )
  return main
}

export type Handler<Value, Action> = (curr: Value, get: Getter, set: Setter, action: Action) => Value

const atomWithAction = <Value, Action>(
  read: Read<Value>,
  handler: Handler<Value, Action>
): WritableAtom<Value, [Action], void> => {
  const store = atom<Value | null>(null)
  const main = atom<Value, [Action], void>(
    (get) => get(store) || read(get),
    (get, set, action: Action) => {
      set(store, handler(get(main), get, set, action))
    }
  )
  return main
}

type AsyncActionAtom<Value, Action> = WritableAtom<Promise<Value>, [Action], Promise<void>>

export type AsyncRead<Value> = (get: Getter) => Promise<Value>

// Copied from jotai/core/atom.d.ts
type SetStateAction<Value> = Value | ((prev: Value) => Value)
export type AsyncHandler<Value, Action> = (
  curr: Value,
  get: Getter,
  set: Setter,
  action: Action,
  storeAtom: WritableAtom<Value | null, [SetStateAction<Value | null>], void>
) => Promise<Value> | Value

const asyncAtomWithAction = <Value, Action>(
  read: AsyncRead<Value>,
  handler: AsyncHandler<Value, Action>
): AsyncActionAtom<Value, Action> => {
  const store = atom<Value | null>(null)
  const main = atom<Promise<Value>, [Action], Promise<void>>(
    async (get) => get(store) || (await read(get)),
    async (get, set, action: Action) => {
      set(store, await handler(await get(main), get, set, action, store))
    }
  )
  return main
}

const asyncAtomFamilyWithAction = <Param, Value, Action>(
  read: (param: Param) => AsyncRead<Value>,
  handler: (
    param: Param,
    storeAtom: AtomFamily<Param, WritableAtom<Value | null, [Value], void>>
  ) => AsyncHandler<Value, Action>
): AtomFamily<Param, AsyncActionAtom<Value, Action>> => {
  /* eslint @typescript-eslint/no-unused-vars: 0 */
  // noinspection JSUnusedLocalSymbols
  const store = atomFamily((param: Param) => atom<Value | null>(null))
  const main = atomFamily((param: Param) =>
    atom<Promise<Value>, [Action], Promise<void>>(
      async (get) => get(store(param)) || (await read(param)(get)),
      async (get, set, action: Action) => {
        set(store(param), await handler(param, store)(await get(main(param)), get, set, action, store(param)))
      }
    )
  )
  return main
}

export const JotaiUtil = {
  isValue,
  atomWithAction,
  asyncAtomFromParent,
  asyncAtomWithAction,
  asyncAtomFamilyWithAction
}
