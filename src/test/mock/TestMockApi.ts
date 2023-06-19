import { produce } from "immer"
import { vi } from "vitest"
import { ObjectUtil } from "../../util/ObjectUtil"
import { MockApi } from "./MockApi"

type Func = (...args: unknown[]) => unknown

const toMock = (obj: unknown, key: string) => {
  if (ObjectUtil.isRecord<Func>(obj)) {
    if (typeof obj[key] === "function") {
      obj[key] = vi.fn(obj[key])
    }
  }
}

export const TestMockApi = produce(MockApi, (d) => {
  Object.values(d).forEach((api) => {
    Object.keys(api).forEach((key) => {
      toMock(api, key)
    })
  })
})
