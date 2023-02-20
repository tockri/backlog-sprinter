import { UserLang } from "@/content/state/BspEnvState"

const ja = {
  selecting: "選択中：",
  updating: "更新中：",
  period: "期間",
  milestoneName: "マイルストーン名",
  auto: "自動",
  moveUnclosed: "未完了の課題を移す",
  archive: "アーカイブする",
  recordVelocity: "ベロシティをWikiに記録する",
  submit: "追加する",
  formTitle: "マイルストーンを追加する",
  sameTitleExists: "同じ名前のマイルストーンが存在します。"
}

const en: typeof ja = {
  selecting: "Selecting: ",
  updating: "Updating: ",
  period: "Period",
  milestoneName: "Milestone Name",
  auto: "Auto",
  moveUnclosed: "Move unclosed issues",
  archive: "Archive",
  recordVelocity: "Record velocity to wiki",
  submit: "Submit",
  formTitle: "Create a new milestone",
  sameTitleExists: "Another milestone has the same title."
}

const resources = { ja, en }

export const i18n = (lang: UserLang) => resources[lang]
