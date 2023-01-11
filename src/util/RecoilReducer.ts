import { RecoilState, useRecoilState } from "recoil"

export type Action = {
  id: string
}

export type RecoilReducer<T, A extends Action> = (curr: T, a: A) => T

export const composeReducers =
  <T, A extends Action>(...reducers: RecoilReducer<T, A>[]): RecoilReducer<T, A> =>
  (curr, a) => {
    let state: T = curr
    reducers.forEach((reducer) => {
      state = reducer(state, a)
    })
    return state
  }

export type Dispatcher<T, A extends Action> = (a: A | A[], callback?: (updated: T) => void) => void

const isArray = <A extends Action>(a: A | A[]): a is A[] =>
  typeof (a as Record<string, unknown>)["indexOf"] === "function"

export const useRecoilReducer = <T, A extends Action>(
  rs: RecoilState<T>,
  reducer: RecoilReducer<T, A>
): [T, Dispatcher<T, A>] => {
  const [state, setState] = useRecoilState(rs)
  const dispatch: Dispatcher<T, A> = (a, callback) => {
    const actions: A[] = isArray(a) ? a : [a]
    setState((curr) => {
      let state = curr
      actions.forEach((action) => {
        state = reducer(state, action)
      })
      if (callback) {
        callback(state)
      }
      return state
    })
  }
  return [state, dispatch]
}
