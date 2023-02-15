import { ObjectUtil } from "@/util/ObjectUtil"
import { MockApi } from "@test/mock/MockApi"
import { produce } from "immer"

type Func = (...args: unknown[]) => unknown

const toMock = (obj: unknown, key: string) => {
  if (ObjectUtil.isRecord<Func>(obj)) {
    if (typeof obj[key] === "function") {
      obj[key] = jest.fn(obj[key])
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
