/**
 * @jest-environment jsdom
 */
import { IssueTypeColor } from "@/content/backlog/ProjectInfo"
import { Api } from "@/content/project/app/state/Api"
import { AppConfState } from "@/content/project/app/state/AppConfState"
import { EnvState } from "@/content/project/app/state/EnvState"
import { useAddIssueTypeModel } from "@/content/project/settings/AddIssueTypeModel"
import { AddIssueTypeFormState, AddIssueTypeFormValue } from "@/content/project/settings/state/State"
import { MockApi } from "@test/mock/MockApi"
import { MockConf } from "@test/mock/MockConf"
import { MockEnv } from "@test/mock/MockEnv"
import "@testing-library/jest-dom"
import { act, render, waitFor } from "@testing-library/react"
import { Immutable } from "immer"
import { createStore, Provider } from "jotai"
import React from "react"
describe("AddIssueTypeModel", () => {
  type Props = Immutable<{
    store: ReturnType<typeof createStore>
    children: React.ReactNode
  }>

  const makeTestStore = () => {
    const store = createStore()
    store.set(AppConfState.atom, MockConf)
    store.set(EnvState.atom, MockEnv)
    store.set(Api.atom, MockApi)
    return store
  }

  const TestWrapper: React.FC<Props> = ({ store, children }) => {
    return (
      <Provider store={store}>
        <React.Suspense fallback="...">{children}</React.Suspense>
      </Provider>
    )
  }

  let model: ReturnType<typeof useAddIssueTypeModel>

  const TestView: React.FC = () => {
    model = useAddIssueTypeModel()
    return <div data-testid="root">{model.values.name}</div>
  }

  test("values", async () => {
    const store = makeTestStore()
    store.set(AddIssueTypeFormState.atom, (curr) => ({ ...curr, creating: true }))
    const dom = render(
      <TestWrapper store={store}>
        <TestView />
      </TestWrapper>
    )
    await waitFor(() => dom.getByTestId("root"))

    expect(model.lang).toBe("ja")
    expect(model.issueTypes[0].name).toBe("タスク")
    expect(model.values).toStrictEqual<AddIssueTypeFormValue>({
      name: "PBI",
      color: IssueTypeColor.pill__issue_type_1,
      creating: true
    })
    await act(async () => {
      await model.onChangeName("product backlog")
    })
    await waitFor(() => dom.getByText("product backlog"))
    expect(model.values).toStrictEqual<AddIssueTypeFormValue>({
      name: "product backlog",
      color: IssueTypeColor.pill__issue_type_1,
      creating: true
    })
  })
})
