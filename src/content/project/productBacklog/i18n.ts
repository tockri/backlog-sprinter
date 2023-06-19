import { UserLang } from "../../state/BspEnvState"

const ja = {
  estimatedHours: "予定",
  actualHours: "実績",
  addNewItem: "プロダクトバックログアイテムを追加",
  milestonePeriod: "期間",
  milestoneName: "マイルストーン名",
  addMilestone: "マイルストーンを追加"
}

const en: typeof ja = {
  estimatedHours: "Estimation",
  actualHours: "Result",
  addNewItem: "Add product backlog item",
  milestonePeriod: "Period",
  milestoneName: "Milestone name",
  addMilestone: "Add milestone"
}

const resources = { ja, en }

export const i18n = (lang: UserLang) => resources[lang]
