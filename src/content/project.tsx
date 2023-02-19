import { UserLang } from "@/content/types"
import React from "react"
import { createRoot } from "react-dom/client"
import { MessageBroker } from "../util/MessageBroker"
import { BacklogApiContext, RealBacklogApi } from "./backlog/BacklogApiForReact"
import SprintIcon from "./images/sprint.svg"
import { ProjectApp } from "./project/app/View"
import { i18n } from "./project/i18n"
import { ProjectEnv } from "./types"
import { jsxToElement } from "./ui/JSXUtil"

const broker = new MessageBroker<ProjectEnv>()

const getButtonPlace = () => document.querySelector(".project-header__summary")

const getUserLang = (): UserLang => (document.documentElement.lang === "ja" ? "ja" : "en")

const getProjectKey = (): string => {
  const path = location.pathname
  const m = path.match(/^[/](?:projects|add|find|board|gantt|wiki|file|git|view)[/]([A-Z_0-9]+)/)
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
    const reactRoot = createRoot(rootElem)
    reactRoot.render(
      <BacklogApiContext.Provider value={RealBacklogApi}>
        <ProjectApp broker={broker} />
      </BacklogApiContext.Provider>
    )
  }
}

const makePortalButton = () => {
  const place = getButtonPlace()
  const projectKey = getProjectKey()
  if (place && projectKey && !place.classList.contains("bsp-project-button-place")) {
    place.classList.add("bsp-project-button-place")
    const lang = getUserLang()
    const t = i18n(lang)
    const buttonWrapper = jsxToElement(
      <div className="bsp-project-button-wrapper">
        <button type="button" className="icon-button icon-button--default -with-text bsp-project-button">
          <SprintIcon width={24} height={24} viewBox="0 0 114 128" />
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
