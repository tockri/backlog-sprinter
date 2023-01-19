import { UserLang } from "../types"

const ja = {
  productBacklog: "プロダクトバックログ",
  setting: "設定",
  formTitle: "スプリント開発"
}

const en: typeof ja = {
  productBacklog: "Product Backlog",
  setting: "Settings",
  formTitle: "Sprint Development"
}

const resources = { ja, en }

export const i18n = (lang: UserLang) => resources[lang]
