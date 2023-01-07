const ja = {
  buttonLabel: "スプリント開発"
}

const en: typeof ja = {
  buttonLabel: "Sprint Development"
}

const resources = { ja, en }

export type UserLang = keyof typeof resources

export const i18n = (lang: UserLang) => resources[lang]
