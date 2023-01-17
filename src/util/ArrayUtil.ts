const chunk = <T>(arr: ReadonlyArray<T>, size: number): ReadonlyArray<ReadonlyArray<T>> => {
  const ret: Array<Array<T>> = []
  for (let i = 0; i < arr.length; i++) {
    if (i % size === 0) {
      ret.push([])
    }
    ret[ret.length - 1].push(arr[i])
  }
  return ret
}

const toRecord = <S extends string | number, T>(arr: ReadonlyArray<T>, toKey: (item: T) => S): Record<S, T> =>
  arr.reduce((rec, item) => {
    rec[toKey(item)] = item
    return rec
  }, {} as Record<S, T>)

export const ArrayUtil = {
  chunk,
  toRecord
}
