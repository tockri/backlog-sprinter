import { UserLang } from "@/content/state/BspEnvState"

const ja = {
  childIssue: "子課題",
  addMilestone: "マイルストーンの新規作成",
  milestoneName: "マイルストーン名",
  milestoneDescription: "マイルストーンのゴール",
  milestoneStartDate: "開始日",
  milestoneReleaseDueDate: "期限日",
  isNameDup: "同じマイルストーン名が存在します。",
  submitForm: "新規作成",
  cancel: "キャンセル",
  archive: "アーカイブ",
  confirmArchive: "マイルストーンをアーカイブしますか？"
}

const en: typeof ja = {
  childIssue: "Children",
  addMilestone: "Create a new milestone",
  milestoneName: "Milestone name",
  milestoneDescription: "The goal of the milestone",
  milestoneStartDate: "Start date",
  milestoneReleaseDueDate: "Release due date",
  isNameDup: "Same name exists.",
  submitForm: "Submit",
  cancel: "Cancel",
  archive: "Archive",
  confirmArchive: "Are you sure to archive this milestone?"
}

const resources = { ja, en }

export const i18n = (lang: UserLang) => resources[lang]
