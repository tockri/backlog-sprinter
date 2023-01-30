const ja = {
  childIssue: "子課題"
}

const en: typeof ja = {
  childIssue: "Children"
}

const resources = { ja, en }

import { UserLang } from "../../types"

export const i18n = (lang: UserLang) => resources[lang]
