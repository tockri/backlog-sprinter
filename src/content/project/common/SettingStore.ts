// ======================================
// Data in localStorage
// ======================================

import { AppSettings, defaultSettings } from "./types"

const keyPrefix = "project.app.settings."

const load = (projectKey: string): AppSettings => {
  const value = localStorage.getItem(keyPrefix + projectKey)
  return value ? purify(JSON.parse(value) as AppSettings) : defaultSettings()
}

const save = (projectKey: string, settings: AppSettings) => {
  localStorage.setItem(keyPrefix + projectKey, JSON.stringify(purify(settings)))
}

const purify = (t: AppSettings): AppSettings => {
  return {
    pbiIssueTypeId: t.pbiIssueTypeId || null
  }
}

export const SettingStore = {
  load,
  save
}
