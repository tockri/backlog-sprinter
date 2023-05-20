type Left<L> = { left: L }
type Right<R> = { right: R }

export type EitherT<L, R> = Left<L> | Right<R>

const isRight = <R>(e: EitherT<unknown, R>): e is Right<R> => Object.keys(e).includes("right")
const isLeft = <L>(e: EitherT<L, unknown>): e is Left<L> => Object.keys(e).includes("left")

const right = <L, R>(r: R): EitherT<L, R> => ({ right: r })
const left = <L, R>(l: L): EitherT<L, R> => ({ left: l })

export const Either = {
  right,
  left,
  isRight,
  isLeft
}
