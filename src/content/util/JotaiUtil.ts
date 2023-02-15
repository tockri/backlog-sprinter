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

export type AsyncRead<Value> = (get: Getter) => Promise<Value>
export type AsyncHandler<Value, Action> = (curr: Value, get: Getter, set: Setter, action: Action) => Promise<Value>

const awaited = async <T>(p: Promise<T> | T): Promise<T> => (p instanceof Promise ? await p : p)

const asyncAtomWithAction = <Value, Action>(read: AsyncRead<Value>, handler: AsyncHandler<Value, Action>) => {
  const store = atom<Value | null>(null)
  const main = atom<Promise<Value>, [Action], Promise<void>>(
    async (get) => get(store) || (await read(get)),
    async (get, set, action: Action) => {
      set(store, await handler(await get(main), get, set, action))
    }
  )
  return main
}

export type AsyncReadWithParam<Param, Value> = (param: Param, get: Getter) => Promise<Value>
export type AsyncHandlerWithParam<Param, Value, Action> = (
  param: Param,
  curr: Value,
  get: Getter,
  set: Setter,
  action: Action,
  storeAtom: AtomFamily<Param, WritableAtom<Value | null, [Value], void>>
) => Promise<Value>

const asyncAtomFamilyWithAction = <Param, Value, Action>(
  read: (param: Param) => AsyncRead<Value>,
  handler: (
    param: Param,
    storeAtom: AtomFamily<Param, WritableAtom<Value | null, [Value], void>>
  ) => AsyncHandler<Value, Action>
) => {
  /* eslint @typescript-eslint/no-unused-vars: 0 */
  const store = atomFamily((param: Param) => atom<Value | null>(null))
  const main = atomFamily((param: Param) =>
    atom<Promise<Value>, [Action], Promise<void>>(
      async (get) => get(store(param)) || (await read(param)(get)),
      async (get, set, action: Action) => {
        set(store(param), await handler(param, store)(await get(main(param)), get, set, action))
      }
    )
  )
  return main
}

export const JotaiUtil = {
  isValue,
  asyncAtomFromParent,
  asyncAtomWithAction,
  asyncAtomFamilyWithAction
}
