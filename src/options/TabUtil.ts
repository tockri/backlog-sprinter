import { Loadable } from "@/util/Loadable"

const currentSite = async (): Promise<string> => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    if (tab && tab.url) {
      return new URL(tab.url).hostname
    }
  } catch (e) {
    console.warn("error on currentSite()", e)
  }
  return ""
}

const loadableCurrentSite = (): Loadable<string> => new Loadable<string>(currentSite())

export const TabUtil = {
  currentSite,
  loadableCurrentSite
}
