/**
 * @jest-environment jsdom
 */
import { IssueTypeColor } from "@/content/backlog/ProjectInfoApi"

import { ProjectConfState } from "@/content/project/app/state/ProjectConfState"
import { useAddIssueTypeModel } from "@/content/project/settings/AddIssueTypeModel"
import { AddIssueTypeFormState, AddIssueTypeFormValue } from "@/content/project/settings/state/State"
import { ApiState } from "@/content/state/ApiState"
import { BspConfState } from "@/content/state/BspConfState"
import { EnvState } from "@/content/state/EnvState"
import { MockBspConf, MockConf } from "@test/mock/MockConf"
import { MockEnv } from "@test/mock/MockEnv"
import { TestMockApi } from "@test/mock/TestMockApi"
import { CustomHookTester } from "@test/util/CustomHookTester"
import "@testing-library/jest-dom"
describe("AddIssueTypeModel", () => {
  const makeTester = async () => {
    const tester = CustomHookTester.create(useAddIssueTypeModel)
    await tester.renderFixture((set) => {
      set(ProjectConfState.atom, MockConf)
      set(BspConfState.atom, MockBspConf)
      set(EnvState.atom, MockEnv)
      set(ApiState.atom, TestMockApi)
      set(AddIssueTypeFormState.atom, (curr) => ({ ...curr, creating: true }))
    })
    return tester
  }

  test("values", async () => {
    const tester = await makeTester()
    tester.test((model) => {
      expect(model.lang).toBe("ja")
      expect(model.issueTypes.map((it) => it.name)).toStrictEqual(["タスク", "バグ", "要望", "その他"])
      expect(model.values).toStrictEqual<AddIssueTypeFormValue>({
        name: "PBI",
        color: IssueTypeColor.pill__issue_type_1,
        creating: true
      })
    })
  })

  test("onChangeName", async () => {
    const tester = await makeTester()
    await tester.act((model) => model.onChangeName("product backlog"))
    tester.test((model) => {
      expect(model.values).toStrictEqual<AddIssueTypeFormValue>({
        name: "product backlog",
        color: IssueTypeColor.pill__issue_type_1,
        creating: true
      })
    })
  })

  test("onChangeColor and onSubmit", async () => {
    const tester = await makeTester()
    await tester.act((model) => model.onChangeColor(IssueTypeColor.pill__issue_type_3))
    expect(TestMockApi.projectInfo.addIssueType).not.toBeCalled()
    await tester.act((model) => model.onSubmit())
    expect(TestMockApi.projectInfo.addIssueType).toBeCalledWith({
      projectId: 78386,
      name: "PBI",
      color: IssueTypeColor.pill__issue_type_3
    })
  })
})
