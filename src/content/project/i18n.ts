const ja = {
  formTitle: "マイルストーンを追加する"
}

const en: typeof ja = {
  formTitle: "Create a new milestone"
}

const resources = { ja, en }

export type UserLang = keyof typeof resources

export const i18n = (lang: UserLang) => resources[lang]
