import { ObjectUtil } from "./ObjectUtil"

test("ObjectUtil.isStrictEqual", () => {
  const eq = ObjectUtil.isStrictEqual
  expect(eq(1, 2)).toBe(false)
  expect(eq(1, 1)).toBe(true)
  expect(eq(null, 1)).toBe(false)
  expect(eq(1, undefined)).toBe(false)
  expect(eq("", "a")).toBe(false)
  expect(eq({}, {})).toBe(true)
  expect(eq(null, {})).toBe(false)
  expect(eq({ id: "1" }, { id: "2" })).toBe(false)
  expect(eq({ id: "1" }, { id: "1" })).toBe(true)
  expect(eq({ id: "1", name: "Alice" }, { name: "Alice", id: "1" })).toBe(true)
  expect(eq({ id: "1" }, { id: "2" })).toBe(false)
  expect(eq(Symbol("a"), Symbol("a"))).toBe(false)
  expect(eq(Symbol.for("a"), Symbol.for("a"))).toBe(true)
  expect(
    eq(
      { id: "1", items: [{ id: "i1" }, { name: "item" }, { age: 10 }] },
      { id: "1", items: [{ id: "i1" }, { name: "item" }, { age: 10 }] }
    )
  ).toBe(true)
  expect(
    eq(
      { id: "1", items: [{ id: "i1" }, { name: "item" }, { age: 10 }] },
      { id: "1", items: [{ id: "i1" }, { name: "item" }, { age: 12 }] }
    )
  ).toBe(false)
})

test("ObjectUtil.purify", () => {
  const part = {
    id: "",
    name: ""
  }
  const obj = {
    id: "obj-1",
    name: "Object 1",
    age: 10
  }
  expect(ObjectUtil.purify(obj, part)).toStrictEqual({
    id: "obj-1",
    name: "Object 1"
  })
})
