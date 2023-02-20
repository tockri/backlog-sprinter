import { UserLang } from "@/content/state/BspEnvState"

const ja = {
  estimatedHours: "予定",
  actualHours: "実績",
  addNewItem: "アイテムを追加する",
  milestonePeriod: "期間",
  milestoneName: "マイルストーン名"
}

const en: typeof ja = {
  estimatedHours: "Estimation",
  actualHours: "Result",
  addNewItem: "Add a new item",
  milestonePeriod: "Period",
  milestoneName: "Milestone Name"
}

const resources = { ja, en }

export const i18n = (lang: UserLang) => resources[lang]
