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

export type Dispatcher<A extends Action> = (a: A) => void

export const useRecoilReducer = <T, A extends Action>(
  rs: RecoilState<T>,
  reducer: RecoilReducer<T, A>
): [T, Dispatcher<A>] => {
  const [state, setState] = useRecoilState(rs)
  const dispatch = (a: A) => setState((curr) => reducer(curr, a))
  return [state, dispatch]
}
