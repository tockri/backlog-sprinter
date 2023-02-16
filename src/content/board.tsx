import { MessageBroker } from "@/util/MessageBroker"
import { Waiter } from "@/util/Waiter"
import React from "react"
import ReactDomClient from "react-dom/client"
import { BacklogApiContext, RealBacklogApi } from "./backlog/BacklogApiForReact"
import { BoardEnv } from "./board/types"
import { BoardView } from "./board/View"
import { UserLang } from "./types"
import { jsxToElement } from "./ui/JSXUtil"

const broker = new MessageBroker<BoardEnv>()

const makeFormInfo = (): BoardEnv => {
  const url = new URL(location.href)
  const projectKey = url.pathname.split("/")[2]
  const selectedMilestoneId = parseInt(url.searchParams.get("milestone") || "0")
  const lang: UserLang = document.documentElement.lang === "ja" ? "ja" : "en"

  return {
    projectKey,
    selectedMilestoneId,
    lang
  }
}

const renderApp = () => {
  if (!document.querySelector(".bsp-form-root")) {
    const rootElem = jsxToElement(<div className="bsp-form-root" />)
    document.body.append(rootElem)
    const reactRoot = ReactDomClient.createRoot(rootElem)
    reactRoot.render(
      <BacklogApiContext.Provider value={RealBacklogApi}>
        <BoardView broker={broker} />
      </BacklogApiContext.Provider>
    )
  }
}

const getButtonPlace = () => document.querySelector("h3#filter\\.milestone")

const makePortalButton = () => {
  const milestoneH3 = getButtonPlace()
  const fieldDiv = milestoneH3?.nextElementSibling
  if (fieldDiv && !fieldDiv.classList.contains("bsp_milestone-field")) {
    fieldDiv.classList.add("bsp_milestone-field")
    const button = jsxToElement<HTMLButtonElement>(
      <button type="button" className="icon-button icon-button--default bsp_milestone-update">
        <svg role="image" className="icon -medium">
          <use xlinkHref="/images/svg/sprite.symbol.svg#icon_add"></use>
        </svg>
      </button>
    )
    button.onclick = () => {
      broker.dispatch(makeFormInfo())
    }
    fieldDiv.appendChild(button)
  }
}

const initialize = () => {
  renderApp()
  makePortalButton()
}

const isReady = (): boolean => !!getButtonPlace()

Waiter.watchInfinitely(isReady, initialize)
