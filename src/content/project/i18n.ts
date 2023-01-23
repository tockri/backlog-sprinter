const ja = {
  buttonLabel: "スプリント開発",
  formTitle: "スプリント開発"
}

const en: typeof ja = {
  buttonLabel: "Sprint Development",
  formTitle: "Sprint Development"
}

const resources = { ja, en }

import { UserLang } from "./types"

export const i18n = (lang: UserLang) => resources[lang]
