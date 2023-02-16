import { UserLang } from "@/content/types"

const ja = {
  buttonLabel: "スプリント開発",
  formTitle: "スプリント開発"
}

const en: typeof ja = {
  buttonLabel: "Sprint Development",
  formTitle: "Sprint Development"
}

const resources = { ja, en }

export const i18n = (lang: UserLang) => resources[lang]
