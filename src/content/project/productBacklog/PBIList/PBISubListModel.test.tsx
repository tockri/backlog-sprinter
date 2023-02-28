/**
 * @jest-environment jsdom
 */

import { usePBISubListModel } from "@/content/project/productBacklog/PBIList/PBISubListModel"
import { PBIListState } from "@/content/project/productBacklog/state/PBIListState"
import { AddIssueTypeFormState } from "@/content/project/settings/state/State"
import { ProjectConfState } from "@/content/project/state/ProjectConfState"
import { ApiState } from "@/content/state/ApiState"
import { BspConfState } from "@/content/state/BspConfState"
import { BspEnvState } from "@/content/state/BspEnvState"
import { MockBspConf, MockProjectConf } from "@test/mock/MockConf"
import { MockEnv } from "@test/mock/MockEnv"
import { TestMockApi } from "@test/mock/TestMockApi"
import { CustomHookTester } from "@test/util/CustomHookTester"
import { useAtomValue } from "jotai"
import React from "react"

describe("PBISubListModel", () => {
  type Model = ReturnType<typeof usePBISubListModel>
  type Args = Parameters<typeof usePBISubListModel>

  const TestView: React.FC<{ tester: CustomHookTester<Model, Args> }> = ({ tester }) => {
    const data = useAtomValue(PBIListState.atom)
    const subList = data.subLists[0]
    tester.useTarget(subList)
    return tester.probeElement()
  }

  const makeTester = async () => {
    const tester = CustomHookTester.create(usePBISubListModel)
    await tester.renderComponent(
      (set) => {
        set(BspEnvState.atom, MockEnv)
        set(ProjectConfState.atom, MockProjectConf)
        set(BspConfState.atom, MockBspConf)
        set(ApiState.atom, TestMockApi)
        set(AddIssueTypeFormState.atom, (curr) => ({ ...curr, creating: true }))
      },
      () => <TestView tester={tester} />
    )
    return tester
  }

  test("show sublist", async () => {
    const tester = await makeTester()
    tester.test((model) => {
      expect(model.milestoneName).toBe("01-18 ~ 01-24 sprint")
      expect(model.dataForTest.items[0].summary).toBe("サマリーが編集できるよ！eee")
    })
  })

  test("arrange hover", async () => {
    const tester = await makeTester()
    await tester.act((model) => {
      model.setArrangeHovered(0, true)
    })

    tester.test((model) => {
      expect(model.isArrangeHovered(0)).toBe(true)
      expect(model.isArrangeHovered(1)).toBe(false)
    })
  })

  test("move hover", async () => {
    const tester = await makeTester()
    await tester.act((model) => {
      model.setMoveHovered(model.dataForTest.items[1].id, true)
    })
    tester.test((model) => {
      expect(model.isMoveHovered(model.dataForTest.items[1].id)).toBe(true)
      expect(model.isMoveHovered(model.dataForTest.items[0].id)).toBe(false)
    })
  })

  test("add issue", async () => {
    const tester = await makeTester()
    const data = tester.getTarget().dataForTest
    const projectId = data.head?.projectId
    const milestoneId = data.head?.id
    await tester.act(async (model) => {
      await model.addNewIssue("issue adding test")
    })
    expect(TestMockApi.issue.add).toBeCalledWith({
      projectId: projectId,
      milestoneId: milestoneId,
      issueTypeId: 389286,
      summary: "issue adding test",
      description: "",
      customField: {
        id: 71491,
        value: -665
      }
    })
    tester.test((model) => {
      expect(model.dataForTest.items.find((issue) => issue.summary === "issue adding test")).toMatchObject({
        id: 200000,
        projectId: 78386,
        summary: "issue adding test",
        milestone: [{ id: 244967 }],
        issueType: { id: 389286 }
      })
    })
  })
})
