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

export class CustomHookTester<Model, Args extends unknown[]> {
  private readonly hookFunc: (...args: Args) => Model
  private target: Model | null = null
  private dom: ReturnType<typeof render> | null = null
  private counter = 0

  private constructor(hookFunc: (...args: Args) => Model) {
    this.hookFunc = hookFunc
  }

  static create<Model, Args extends unknown[]>(hookFunc: (...args: Args) => Model) {
    return new CustomHookTester(hookFunc)
  }

  /**
   * return value of the useXXXXX hook function passed by constructor
   */
  getTarget(): Model {
    if (this.target) {
      return this.target
    } else {
      throw new Error("target is not set")
    }
  }

  /**
   * execute the useXXXXX hook function passed by constructor
   * @param args argument for useXXXXX
   */
  useTarget(...args: Args): Model {
    this.target = this.hookFunc(...args)
    return this.target
  }

  /**
   * React component to wait being rendered
   */
  probeElement(): React.ReactElement {
    this.counter++
    return <span>{`helper-probe-${this.counter}`}</span>
  }

  /**
   * render component tree using custom component
   * @param initialize callback to set initial values to atoms
   * @param component custom component
   */
  async renderComponent(initialize: (set: Store["set"]) => void, component: () => React.ReactElement) {
    const store = makeJotaiStore(initialize)
    this.dom = render(<Wrapper store={store}>{component()}</Wrapper>)
    await this.wait()
    return
  }

  /**
   * render default component tree using the useXXXXX hook function passed by constructor
   * @param initialize
   * @param args
   */
  async renderFixture(initialize: (set: Store["set"]) => void, ...args: Args) {
    const Fixture: React.FC = () => {
      this.useTarget(...args)
      return <>{this.probeElement()}</>
    }
    return this.renderComponent(initialize, () => <Fixture />)
  }

  /**
   * return value of `render()` of @testing-library/react
   */
  getDom(): RenderResult {
    if (this.dom) {
      return this.dom
    } else {
      throw new Error("dom is not set.  try `render()` before.")
    }
  }

  /**
   * wait for re-rendering.
   * if you get a error like "Warning: A suspended resource finished loading inside a test, but the event was not wrapped in act(...)."
   * please add
   * ```typescript
   * await tester.wait()
   * ```
   * @param count
   */
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

  /**
   * write test code using objects from `getTarget()` and `getDom()`
   * @param content
   */
  test<Result extends void | Promise<void>>(content: (target: Model, dom: RenderResult) => Result): Result {
    return content(this.getTarget(), this.getDom())
  }

  /**
   * write mutation code using object from `getTarget()`
   * @param action
   */
  act<T>(action: (target: Model) => T | Promise<T>): Promise<T>
  act(action: (target: Model) => void | Promise<void>): Promise<void> {
    return act(() => action(this.getTarget()))
  }
}
