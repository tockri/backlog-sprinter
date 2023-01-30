const ja = {
  estimatedHours: "予定",
  actualHours: "実績"
}

const en: typeof ja = {
  estimatedHours: "Estimation",
  actualHours: "Result"
}

const resources = { ja, en }

import { UserLang } from "../types"

export const i18n = (lang: UserLang) => resources[lang]
