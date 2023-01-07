import React from "react"
import ReactDomClient from "react-dom/client"
import { MessageBroker } from "../util/MessageBroker"
import { ProjectApp } from "./project/App"
import { i18n, UserLang } from "./project/i18n"
import { PBFormInfo } from "./project/types"
import { jsxToElement } from "./ui/JSXUtil"

const broker = new MessageBroker<PBFormInfo>()

const getButtonPlace = () => document.querySelector(".project-header__summary")

const getUserLang = (): UserLang => (document.documentElement.lang === "ja" ? "ja" : "en")

const getProjectKey = (): string => {
  const path = location.pathname
  const m = path.match(/^[/](?:projects|add|find|board|gantt|wiki|file|git|view)[/]([A-Z_]+)/)
  if (m) {
    return m[1]
  } else {
    return ""
  }
}

const renderApp = () => {
  if (!document.querySelector(".bsp-project-root")) {
    const rootElem = jsxToElement(<div className="bsp-project-root" />)
    document.body.append(rootElem)
    const reactRoot = ReactDomClient.createRoot(rootElem)
    reactRoot.render(<ProjectApp broker={broker} />)
  }
}

const makePortalButton = () => {
  const place = getButtonPlace()
  const projectKey = getProjectKey()
  if (place && projectKey && !place.classList.contains("bsp-project-button-place")) {
    place.classList.add("bsp-project-button-place")
    const iconUrl = chrome.runtime.getURL("images/sprint.svg")
    const lang = getUserLang()
    const t = i18n(lang)
    const buttonWrapper = jsxToElement(
      <div className="bsp-project-button-wrapper">
        <button type="button" className="icon-button icon-button--default -with-text bsp-project-button">
          <img src={iconUrl} className="icon -large" />
          <span className="_assistive-text">{t.buttonLabel}</span>
        </button>
      </div>
    )
    const button = buttonWrapper.firstChild as HTMLButtonElement
    button.onclick = () => {
      broker.dispatch({ lang, projectKey })
    }
    place.append(buttonWrapper)
  }
}

const initialize = () => {
  renderApp()
  makePortalButton()
}

initialize()
