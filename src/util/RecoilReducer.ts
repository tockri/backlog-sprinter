import { RecoilState, useRecoilState, useResetRecoilState } from "recoil"

export type Action = {
  readonly id: string
}

export type ResetAction = Action & {
  readonly id: "reset"
}
export const Reset: ResetAction = {
  id: "reset"
}

export type RecoilReducer<T, A extends Action> = (curr: T, a: A) => T

export const composeReducers =
  <T, A extends Action>(...reducers: RecoilReducer<T, A>[]): RecoilReducer<T, A> =>
  (curr, a) =>
    reducers.reduce((state, reducer) => reducer(state, a), curr)

export type Dispatcher<T, A extends Action> = (a: A | A[], callback?: (updated: T) => void) => void

const isArray = <A extends Action>(a: A | A[]): a is A[] =>
  typeof (a as Record<string, unknown>)["indexOf"] === "function"

export const useRecoilReducer = <T, A extends Action>(
  reducer: RecoilReducer<T, A>,
  rs: RecoilState<T>
): [T, Dispatcher<T, A>] => {
  const [state, setState] = useRecoilState(rs)
  const reset = useResetRecoilState(rs)
  const dispatch: Dispatcher<T, A> = (a, callback) => {
    const actions: A[] = isArray(a) ? a : [a]
    if (actions.find((a) => a.id === Reset.id)) {
      reset()
    } else {
      setState((curr) => {
        const reduced = actions.reduce((state, action) => reducer(state, action), curr)
        if (callback) {
          callback(reduced)
        }
        return reduced
      })
    }
  }
  return [state, dispatch]
}
