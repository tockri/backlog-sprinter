import React from "react"
import ReactDomClient from "react-dom/client"
import { jsxToElement } from "./ui/JSXUtil"

// const broker = new MessageBroker<string>()

const renderApp = () => {
  if (!document.querySelector(".bsp-project-root")) {
    const rootElem = jsxToElement(<div className="bsp-project-root" />)
    document.body.append(rootElem)
    const reactRoot = ReactDomClient.createRoot(rootElem)
    reactRoot.render(<b>Project</b>)
  }
}

const initialize = () => {
  renderApp()
}

initialize()
