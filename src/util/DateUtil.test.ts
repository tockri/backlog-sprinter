import { DateUtil } from "./DateUtil"

test("DateUtil.beginning", () => {
  expect(DateUtil.beginningOfDay(new Date("2022-10-11 09:12:00"))).toStrictEqual(new Date("2022-10-11 00:00:00"))
})