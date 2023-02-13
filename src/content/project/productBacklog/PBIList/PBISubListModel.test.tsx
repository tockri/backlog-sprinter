/**
 * @jest-environment jsdom
 */

import { Api } from "@/content/project/app/state/Api"
import { AppConfState } from "@/content/project/app/state/AppConfState"
import { EnvState } from "@/content/project/app/state/EnvState"
import { usePBISubListModel } from "@/content/project/productBacklog/PBIList/PBISubListModel"
import { PBIListState } from "@/content/project/productBacklog/state/PBIListState"
import { AddIssueTypeFormState } from "@/content/project/settings/state/State"
import { MockApi } from "@test/mock/MockApi"
import { MockConf } from "@test/mock/MockConf"
import { MockEnv } from "@test/mock/MockEnv"
import { CustomHookTester, Tester } from "@test/util/CustomHookTester"
import { useAtomValue } from "jotai"
import React from "react"

describe("PBISubListModel", () => {
  type Model = ReturnType<typeof usePBISubListModel>
  type Args = Parameters<typeof usePBISubListModel>

  const TestView: React.FC<{ tester: Tester<Model, Args> }> = ({ tester }) => {
    const data = useAtomValue(PBIListState.atom)
    const subList = data.subLists[0]
    tester.useTarget(subList)
    return <>{tester.probeElement()}</>
  }

  const makeTester = async () => {
    const tester = CustomHookTester.create(usePBISubListModel)
    await tester.renderComponent(
      (set) => {
        set(AppConfState.atom, MockConf)
        set(EnvState.atom, MockEnv)
        set(Api.atom, MockApi)
        set(AddIssueTypeFormState.atom, (curr) => ({ ...curr, creating: true }))
      },
      () => <TestView tester={tester} />
    )
    // await tester.wait()
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
})
