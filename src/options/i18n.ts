import { Lang } from "./state/LangState"

const ja = {
  apiKey: "APIキーの設定",
  site: "サイト",
  key: "APIキー",
  inputKey: "APIキーを入力してください"
}

const en: typeof ja = {
  apiKey: "API Key Setting",
  site: "Site",
  key: "Key",
  inputKey: "Input your API Key"
}

const resources = { ja, en }

export const i18n = (lang: Lang) => resources[lang]
