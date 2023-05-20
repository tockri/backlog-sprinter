import { Waiter } from "@/util/Waiter"
import { Provider } from "jotai"
import React from "react"
import ReactDomClient from "react-dom/client"
import { BoardView } from "./board/View"
import { BspCommon } from "./BspCommon"
import { JsxUtil } from "./ui/JsxUtil"

const renderApp = () => {
  if (!document.querySelector(".bsp-form-root")) {
    const rootElem = JsxUtil.jsxToElement(<div className="bsp-form-root" />)
    document.body.append(rootElem)
    const reactRoot = ReactDomClient.createRoot(rootElem)
    reactRoot.render(
      <Provider store={BspCommon.jotaiStore}>
        <BoardView />
      </Provider>
    )
  }
}

const getButtonPlace = () => document.querySelector("h3#filter\\.milestone")

const makePortalButton = () => {
  const milestoneH3 = getButtonPlace()
  const fieldDiv = milestoneH3?.nextElementSibling
  if (fieldDiv && !fieldDiv.classList.contains("bsp_milestone-field")) {
    fieldDiv.classList.add("bsp_milestone-field")
    const button = JsxUtil.jsxToElement<HTMLButtonElement>(
      <button type="button" className="icon-button icon-button--default bsp_milestone-update">
        <svg role="image" className="icon -medium">
          <use xlinkHref="/images/svg/sprite.symbol.svg#icon_add"></use>
        </svg>
      </button>
    )
    button.onclick = () => {
      BspCommon.start()
    }
    fieldDiv.appendChild(button)
  }
}

const initialize = () => {
  renderApp()
  makePortalButton()
}

Waiter.watchInfinitely(() => !!getButtonPlace(), initialize)
