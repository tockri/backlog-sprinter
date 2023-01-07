import React from "react"
import ReactDomClient from "react-dom/client"
import { MessageBroker } from "../util/MessageBroker"
import { ProjectApp } from "./project/App"
import { PBFormInfo } from "./project/types"
import { jsxToElement } from "./ui/JSXUtil"

const broker = new MessageBroker<PBFormInfo>()

const renderApp = () => {
  if (!document.querySelector(".bsp-project-root")) {
    const rootElem = jsxToElement(<div className="bsp-project-root" />)
    document.body.append(rootElem)
    const reactRoot = ReactDomClient.createRoot(rootElem)
    reactRoot.render(<ProjectApp broker={broker} />)
  }
}

const initialize = () => {
  renderApp()
}

initialize()
