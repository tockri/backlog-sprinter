export type ReducerAction = {
  type: string
}
export type ReducerFunc<S, A> = (state: S, action: A) => S

const compose =
  <S, A>(...reducers: ReducerFunc<S, A>[]): ReducerFunc<S, A> =>
  (state, action) =>
    reducers.reduce((stt, reducer) => reducer(stt, action), state)

export const ReducerUtil = {
  compose
}
