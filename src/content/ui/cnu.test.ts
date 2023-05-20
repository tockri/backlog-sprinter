import { cnu } from "./cnu"

describe("cnu", () => {
  test("arguments", () => {
    expect(cnu("foo", "bar")).toBe("foo bar")
  })
  test("simple array", () => {
    expect(cnu(["foo", "bar"])).toBe("foo bar")
  })
  test("object", () => {
    expect(
      cnu({
        foo: true,
        bar: false
      })
    ).toBe("foo")
  })
  test("mixed", () => {
    expect(cnu(["foo", 0, { bar: true, baz: false }])).toBe("foo bar")
  })
})
