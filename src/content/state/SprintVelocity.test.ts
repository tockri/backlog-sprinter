import { SprintVelocity, VelocityUtil } from "./SprintVelocity"

describe("SprintUtil", () => {
  test("toString one", () => {
    const s: SprintVelocity = {
      id: 1293,
      endDate: new Date("2023-02-04 10:05:01"),
      pbiVelocity: 1.5,
      otherVelocity: 12.5,
      issueIds: [100, 200, 300]
    }
    expect(VelocityUtil.toString(s)).toBe("|1293|2023-02-04|1.5|12.5|100,200,300|")
  })

  test("parse one", () => {
    expect(VelocityUtil.parse("|1293|2023-02-04|1.5|12.5|100,200,300|")).toStrictEqual({
      id: 1293,
      endDate: new Date("2023-02-04 00:00:00"),
      pbiVelocity: 1.5,
      otherVelocity: 12.5,
      issueIds: [100, 200, 300]
    })
  })

  test("toStringAll", () => {
    const data = [
      {
        id: 1293,
        endDate: new Date("2023-02-04 10:05:01"),
        pbiVelocity: 1.5,
        otherVelocity: 12.5,
        issueIds: [100, 200, 300]
      },
      {
        id: 1295,
        endDate: new Date("2023-02-11 10:05:01"),
        pbiVelocity: 3,
        otherVelocity: 11.5,
        issueIds: [101, 201, 301]
      },
      {
        id: 1301,
        endDate: new Date("2023-02-18 10:05:01"),
        pbiVelocity: 5,
        otherVelocity: 20.5,
        issueIds: [102, 202, 302]
      }
    ]
    expect(VelocityUtil.toStringAll(data)).toBe(`|1293|2023-02-04|1.5|12.5|100,200,300|
|1295|2023-02-11|3|11.5|101,201,301|
|1301|2023-02-18|5|20.5|102,202,302|`)
  })

  test("parseAll", () => {
    const loaded = `|1293|2023-02-04|1.5|12.5|100,200,300|
|1295|2023-02-11|3|11.5|101,201,301|
|1301|2023-02-18|5|20.5|102,202,302|

(backlog-sprinter-velocity)(DO NOT DELETE THIS LINE)`
    expect(VelocityUtil.parseAll(loaded)).toStrictEqual([
      {
        id: 1293,
        endDate: new Date("2023-02-04 00:00:00"),
        pbiVelocity: 1.5,
        otherVelocity: 12.5,
        issueIds: [100, 200, 300]
      },
      {
        id: 1295,
        endDate: new Date("2023-02-11 00:00:00"),
        pbiVelocity: 3,
        otherVelocity: 11.5,
        issueIds: [101, 201, 301]
      },
      {
        id: 1301,
        endDate: new Date("2023-02-18 00:00:00"),
        pbiVelocity: 5,
        otherVelocity: 20.5,
        issueIds: [102, 202, 302]
      }
    ])
  })
})
