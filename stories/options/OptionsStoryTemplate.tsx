import { Loading } from "@/content/ui/Loading"
import { Immutable } from "immer"
import { createStore, Provider } from "jotai"
import React from "react"

type Store = ReturnType<typeof createStore>
type SetStore = Store["set"]

export type OptionsStoryTemplateProps = Immutable<{
  initialValues?: (set: SetStore) => void
  children: React.ReactNode
}>

export const OptionsStoryTemplate: React.FC<OptionsStoryTemplateProps> = ({ initialValues, children }) => {
  const store = createStore()
  initialValues && initialValues(store.set)
  return (
    <div style={{ width: 516, maxWidth: 516, maxHeight: 800, overflow: "auto", border: "1px solid gray" }}>
      <Provider store={store}>
        <React.Suspense fallback={<Loading />}>
          <div style={{ margin: 8, fontSize: "75%" }}>{children}</div>
        </React.Suspense>
      </Provider>
    </div>
  )
}
