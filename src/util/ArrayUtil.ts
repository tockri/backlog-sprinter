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

export const ArrayUtil = {
  chunk
}
