import { Version } from "@/content/backlog/ProjectInfoApi"
import { MockData } from "@test/mock/MockApi-data"
import { SprintVelocity, VelocityFunc } from "./SprintVelocity"

describe("SprintVelocity", () => {
  test("toString one", () => {
    const s: SprintVelocity = {
      id: 1293,
      endDate: new Date("2023-02-04 10:05:01"),
      pbiVelocity: 1.5,
      otherVelocity: 12.5,
      keyIds: [100, 200, 300]
    }
    expect(VelocityFunc.toString(s)).toBe("|1293|2023-02-04|1.5|12.5| 100,200,300 |")
  })

  test("parse one", () => {
    expect(VelocityFunc.parse("|1293|2023-02-04|1.5|12.5| 100,200,300 |")).toStrictEqual<SprintVelocity>({
      id: 1293,
      endDate: new Date("2023-02-04 00:00:00"),
      pbiVelocity: 1.5,
      otherVelocity: 12.5,
      keyIds: [100, 200, 300]
    })
  })

  test("toStringAll", () => {
    const data: SprintVelocity[] = [
      {
        id: 1293,
        endDate: new Date("2023-02-04 10:05:01"),
        pbiVelocity: 1.5,
        otherVelocity: 12.5,
        keyIds: [100, 200, 300]
      },
      {
        id: 1295,
        endDate: new Date("2023-02-11 10:05:01"),
        pbiVelocity: 3,
        otherVelocity: 11.5,
        keyIds: []
      },
      {
        id: 1301,
        endDate: new Date("2023-02-18 10:05:01"),
        pbiVelocity: 5,
        otherVelocity: 20.5,
        keyIds: [102, 202, 302]
      }
    ]
    expect(VelocityFunc.toStringAll(data)).toBe(`|1293|2023-02-04|1.5|12.5| 100,200,300 |
|1295|2023-02-11|3|11.5|  |
|1301|2023-02-18|5|20.5| 102,202,302 |`)
  })

  test("parseAll", () => {
    const loaded = `# Velocity
|ID|Date|PBI|Others|Issue Ids|
|--|--|--|--|--|
|1293|2023-02-04|1.5|12.5|100,200,300|
|1295|2023-02-11|3|11.5|101,201,301|
|1301|2023-02-18|5|20.5|  |

(backlog-sprinter-velocity)(DO NOT DELETE THIS LINE)`
    expect(VelocityFunc.parseAll(loaded)).toStrictEqual<SprintVelocity[]>([
      {
        id: 1293,
        endDate: new Date("2023-02-04 00:00:00"),
        pbiVelocity: 1.5,
        otherVelocity: 12.5,
        keyIds: [100, 200, 300]
      },
      {
        id: 1295,
        endDate: new Date("2023-02-11 00:00:00"),
        pbiVelocity: 3,
        otherVelocity: 11.5,
        keyIds: [101, 201, 301]
      },
      {
        id: 1301,
        endDate: new Date("2023-02-18 00:00:00"),
        pbiVelocity: 5,
        otherVelocity: 20.5,
        keyIds: []
      }
    ])
  })

  test("appendRecord", () => {
    const existing = VelocityFunc.parseAll(`# Velocity
|ID|Date|PBI|Others|IssueKeyIds|
|--|--|--|--|--|
|1293|2023-02-04|1.5|12.5|100,200,300|
|1295|2023-02-11|3|11.5|101,201,301|
|1301|2023-02-18|5|20.5|  |

(backlog-sprinter-velocity)(DO NOT DELETE THIS LINE)`)
    const version: Version = {
      id: 100,
      startDate: "2023-02-19",
      projectId: 1,
      name: "",
      description: "",
      displayOrder: 0,
      archived: false,
      releaseDueDate: "2023-02-25"
    }

    const issues = [
      ...MockData.productBacklogBT.filter((i) => i.status.id === 4),
      ...MockData.childIssuesBT.filter((i) => i.status.id === 4)
    ]
    const updated = VelocityFunc.appendRecord(version, issues, 389286, existing)
    expect(updated[3]).toStrictEqual<SprintVelocity>({
      id: 100,
      endDate: new Date("2023-02-24T15:00:00Z"),
      pbiVelocity: 27,
      otherVelocity: 3,
      keyIds: [9, 8, 7, 6, 5, 12, 11, 10]
    })
  })
})
