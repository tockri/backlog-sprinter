import { UserLang } from "@/content/types"

const ja = {
  productBacklog: "プロダクト\nバックログ",
  setting: "設定",
  buttonLabel: "スプリント開発",
  formTitle: "スプリント開発",
  stat: "統計"
}

const en: typeof ja = {
  productBacklog: "Product\nBacklog",
  setting: "Settings",
  buttonLabel: "Sprint Development",
  formTitle: "Sprint Development",
  stat: "Statistics"
}

const resources = { ja, en }

export const i18n = (lang: UserLang) => resources[lang]
