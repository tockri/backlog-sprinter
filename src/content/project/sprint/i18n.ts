import { UserLang } from "../../state/BspEnvState"

const ja = {
  currentSprint: "現在のスプリント用マイルストーン",
  nextSprint: "次のスプリント用マイルストーンを作成",
  period: "期間",
  milestoneName: "マイルストーン名",
  auto: "自動",
  moveUnclosed: "未完了の課題を移す",
  archive: "現在のマイルストーンをアーカイブする",
  recordVelocity: "ベロシティをWikiに記録する",
  submit: "追加する",
  submitButtonLabel: "作成する",
  sameTitleExists: "同じ名前のマイルストーンが存在します。",
  progress: (message:string) => `移行中：${message}`,
  success: "作成しました。",
  linkLabel: "ボード画面に移動する"
}

const en: typeof ja = {
  currentSprint: "Milestone for current sprint",
  nextSprint: "Make milestone for next sprint",
  period: "Period",
  milestoneName: "Milestone name",
  auto: "Auto",
  moveUnclosed: "Move unclosed issues",
  archive: "Archive current",
  recordVelocity: "Record velocity to wiki",
  submit: "Submit",
  submitButtonLabel: "Create",
  sameTitleExists: "Another milestone has the same title.",
  progress: (message:string) => `Moving: ${message}`,
  success: "Completed.",
  linkLabel: "Go to Board"
}

const resources = { ja, en }

export const i18n = (lang: UserLang) => resources[lang]
