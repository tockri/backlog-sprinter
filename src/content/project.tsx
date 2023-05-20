import { BackgroundClient } from "@/background/BackgroundClient"
import { Provider } from "jotai"
import React from "react"
import { createRoot } from "react-dom/client"
import { BspCommon } from "./BspCommon"
import SprintIcon from "./images/sprint.svg"
import { i18n } from "./project/i18n"
import { ProjectApp } from "./project/View"
import { JsxUtil } from "./ui/JsxUtil"

const getButtonPlace = () => document.querySelector(".project-header__summary")

const renderApp = () => {
  if (!document.querySelector(".bsp-project-root")) {
    const rootElem = JsxUtil.jsxToElement(<div className="bsp-project-root" />)
    document.body.append(rootElem)
    const reactRoot = createRoot(rootElem)
    reactRoot.render(
      <Provider store={BspCommon.jotaiStore}>
        <ProjectApp />
      </Provider>
    )
  }
}

const makePortalButton = () => {
  const place = getButtonPlace()
  const env = BspCommon.buildEnv()
  if (place && env.projectKey && !place.classList.contains("bsp-project-button-place")) {
    place.classList.add("bsp-project-button-place")
    const t = i18n(env.lang)
    const buttonWrapper = JsxUtil.jsxToElement(
      <div className="bsp-project-button-wrapper">
        <button type="button" className="icon-button icon-button--default -with-text bsp-project-button">
          <SprintIcon width={24} height={24} viewBox="0 0 114 128" />
          <span className="_assistive-text">{t.buttonLabel}</span>
        </button>
      </div>
    )
    const button = buttonWrapper.firstChild as HTMLButtonElement
    button.onclick = async () => {
      const hostname = location.hostname
      const token = await BackgroundClient.getStoredAccessToken(hostname)
      if (token) {
        BspCommon.start(env)
      } else {
        const code = await BackgroundClient.issueKey()
        window.open(`https://backlog-sprinter.vercel.app/api/start?host=${hostname}&key=${code}`, "_blank")
      }
    }
    place.append(buttonWrapper)
  }
}

const initialize = () => {
  renderApp()
  makePortalButton()
}

initialize()
