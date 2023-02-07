const ja = {
  childIssue: "子課題",
  addMilestone: "マイルストーンの新規作成",
  milestoneName: "マイルストーン名",
  milestoneDescription: "マイルストーンのゴール",
  milestoneStartDate: "開始日",
  milestoneReleaseDueDate: "期限日",
  isNameDup: "同じマイルストーン名が存在します。"
}

const en: typeof ja = {
  childIssue: "Children",
  addMilestone: "Create a new milestone",
  milestoneName: "Milestone name",
  milestoneDescription: "The goal of the milestone",
  milestoneStartDate: "Start date",
  milestoneReleaseDueDate: "Release due date",
  isNameDup: "Same name exists."
}

const resources = { ja, en }

import { UserLang } from "../../types"

export const i18n = (lang: UserLang) => resources[lang]
