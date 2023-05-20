import { UserLang } from "@/content/state/BspEnvState"

const ja = {
  productBacklog: "プロダクト\nバックログ",
  setting: "設定",
  buttonLabel: "スプリント開発",
  formTitle: "スプリント開発",
  stat: "統計",
  graphLabels: {
    pbi: "PBI",
    others: "その他の課題",
    mva3: "3週移動平均"
  },
  pbiVelocity: "PBIのベロシティ",
  othersVelocity: "その他の課題のベロシティ"
}

const en: typeof ja = {
  productBacklog: "Product\nBacklog",
  setting: "Settings",
  buttonLabel: "Sprint Development",
  formTitle: "Sprint Development",
  stat: "Statistics",
  graphLabels: {
    pbi: "PBI",
    others: "Others",
    mva3: "3-weeks moving average"
  },
  pbiVelocity: "PBI Velocity",
  othersVelocity: "Others Velocity"
}

const resources = { ja, en }

export const i18n = (lang: UserLang) => resources[lang]
