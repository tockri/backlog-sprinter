import { ArrayUtil } from "./ArrayUtil"

test("ArrayUtil.chunk divides an array into 3", () => {
  const orig = [1, 2, 3, 4, 5, 6, 7, 8]
  expect(ArrayUtil.chunk(orig, 3)).toStrictEqual([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8]
  ])
})
