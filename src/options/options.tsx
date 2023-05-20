import { createStore, Provider } from "jotai"
import React from "react"
import { createRoot } from "react-dom/client"
import { OptionsView } from "./View"

const store = createStore()

const initialize = () => {
  const root = document.getElementById("root")
  if (root) {
    const reactRoot = createRoot(root)
    reactRoot.render(
      <Provider store={store}>
        <OptionsView />
      </Provider>
    )
  } else {
    console.error("root not found.")
  }
}
initialize()
