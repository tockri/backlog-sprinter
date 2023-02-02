const ja = {
  estimatedHours: "予定",
  actualHours: "実績",
  addNewItem: "アイテムを追加する"
}

const en: typeof ja = {
  estimatedHours: "Estimation",
  actualHours: "Result",
  addNewItem: "Add a new item"
}

const resources = { ja, en }

import { UserLang } from "../types"

export const i18n = (lang: UserLang) => resources[lang]
