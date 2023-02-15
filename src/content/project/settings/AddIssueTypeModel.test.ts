/**
 * @jest-environment jsdom
 */
import { IssueTypeColor } from "@/content/backlog/ProjectInfo"
import { Api } from "@/content/project/app/state/Api"
import { AppConfState } from "@/content/project/app/state/AppConfState"
import { EnvState } from "@/content/project/app/state/EnvState"
import { useAddIssueTypeModel } from "@/content/project/settings/AddIssueTypeModel"
import { AddIssueTypeFormState, AddIssueTypeFormValue } from "@/content/project/settings/state/State"
import { MockConf } from "@test/mock/MockConf"
import { MockEnv } from "@test/mock/MockEnv"
import { TestMockApi } from "@test/mock/TestMockApi"
import { CustomHookTester } from "@test/util/CustomHookTester"
import "@testing-library/jest-dom"
describe("AddIssueTypeModel", () => {
  const makeTester = async () => {
    const tester = CustomHookTester.create(useAddIssueTypeModel)
    await tester.renderFixture((set) => {
      set(AppConfState.atom, MockConf)
      set(EnvState.atom, MockEnv)
      set(Api.atom, TestMockApi)
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
    expect(TestMockApi.projectInfo.createIssueType).not.toBeCalled()
    await tester.act((model) => model.onSubmit())
    expect(TestMockApi.projectInfo.createIssueType).toBeCalledWith({
      projectId: 78386,
      name: "PBI",
      color: IssueTypeColor.pill__issue_type_3
    })
  })
})
