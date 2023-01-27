import { UserLang } from "../types"

const ja = {
  productBacklog: "プロダクト\nバックログ",
  setting: "設定",
  formTitle: "スプリント開発",
  stat: "統計"
}

const en: typeof ja = {
  productBacklog: "Product\nBacklog",
  setting: "Settings",
  formTitle: "Sprint Development",
  stat: "Statistics"
}

const resources = { ja, en }

export const i18n = (lang: UserLang) => resources[lang]
