import "@testing-library/jest-dom"
import { act, render, waitFor } from "@testing-library/react"
import { createStore, Provider } from "jotai"
import React from "react"

type Store = ReturnType<typeof createStore>

const makeJotaiStore = (initialize?: (set: Store["set"]) => void) => {
  const store = createStore()
  initialize && initialize(store.set)
  return store
}

const Wrapper: React.FC<{
  store: Store
  children: React.ReactNode
}> = ({ store, children }) => {
  return (
    <Provider store={store}>
      <React.Suspense fallback="...">{children}</React.Suspense>
    </Provider>
  )
}

type RenderResult = ReturnType<typeof render>
type ActResult = ReturnType<typeof act>

export interface Tester<Model, Args extends unknown[]> {
  probeElement(): React.ReactElement
  useTarget(...args: Args): Model
  renderComponent(initialize: (set: Store["set"]) => void, component: () => React.ReactElement): Promise<void>
  renderFixture(initialize: (set: Store["set"]) => void, ...args: Args): Promise<void>
  getDom(): RenderResult
  getTarget(): Model
  wait(count?: number): Promise<void>
  test<Result extends void | Promise<void>>(content: (target: Model, dom: RenderResult) => Result): Result
  act(action: (target: Model) => void | Promise<void>): ActResult
}

class TesterImpl<Model, Args extends unknown[]> implements Tester<Model, Args> {
  private readonly hookFunc: (...args: Args) => Model
  private target: Model | null = null
  private dom: ReturnType<typeof render> | null = null
  private counter = 0

  constructor(hookFunc: (...args: Args) => Model) {
    this.hookFunc = hookFunc
  }

  getTarget(): Model {
    if (this.target) {
      return this.target
    } else {
      throw new Error("target is not set")
    }
  }

  useTarget(...args: Args): Model {
    this.target = this.hookFunc(...args)
    return this.target
  }

  probeElement(): React.ReactElement {
    this.counter++
    return <span>{`helper-probe-${this.counter}`}</span>
  }

  render(...args: Parameters<typeof render>): RenderResult {
    this.dom = render(...args)
    return this.dom
  }

  async renderComponent(initialize: (set: Store["set"]) => void, component: () => React.ReactElement) {
    const store = makeJotaiStore(initialize)
    this.dom = render(<Wrapper store={store}>{component()}</Wrapper>)
    await this.wait()
    return
  }

  async renderFixture(initialize: (set: Store["set"]) => void, ...args: Args) {
    const Fixture: React.FC = () => {
      this.useTarget(...args)
      return <>{this.probeElement()}</>
    }
    return this.renderComponent(initialize, () => <Fixture />)
  }

  getDom(): RenderResult {
    if (this.dom) {
      return this.dom
    } else {
      throw new Error("dom is not set.  try `render()` before.")
    }
  }

  async wait(count?: number) {
    const target = this.counter + (count && count > 0 ? count : 1)
    await waitFor(() => this.getDom().getByText(`helper-probe-${target}`), {
      timeout: 1000,
      onTimeout: (error) => {
        return new Error(
          "Missing probe.  Perhaps you missed {tester.probeElement()} in your test component?" + error.message
        )
      }
    })
  }

  test<Result extends void | Promise<void>>(content: (target: Model, dom: RenderResult) => Result): Result {
    return content(this.getTarget(), this.getDom())
  }

  act(action: (target: Model) => void | Promise<void>): ReturnType<typeof act> {
    return act(() => action(this.getTarget()))
  }
}

export const CustomHookTester = {
  makeJotaiStore,
  Wrapper,
  create: <Model, Args extends unknown[]>(hookFunc: (...args: Args) => Model): Tester<Model, Args> =>
    new TesterImpl(hookFunc)
}
