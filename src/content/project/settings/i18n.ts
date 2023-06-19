import { UserLang } from "../../state/BspEnvState"

const ja = {
  issueTypeLabel: "プロダクトバックログを表す課題種別",
  customFieldTitle: "プロダクトバックログの順序",
  customFieldNotExist: "カスタム属性が作られていません。",
  createLabel: "作る",
  deleteLabel: "削除する",
  confirmDelete: "このカスタム属性を削除するとプロダクトバックログの並び順がクリアされます。よろしいですか？",
  storeOrderOn: (name: string) => `カスタム属性「${name}」に格納します。`,
  setIssueType: "まず課題種別を決めてください。",
  errorNoRightForCreateCustomField: "このプロジェクトでカスタム属性を操作する権限がありません。",
  errorInsufficientLicense: "お使いのプランではカスタム属性を作成できません。",
  creatingIssueType: "新しくプロダクトバックログアイテムのための課題種別を作成します。",
  createIssueTypeName: "種別名",
  createIssueTypeColor: "背景色",
  cancelLabel: "キャンセル",
  existing: "登録済み",
  velocityTitle: "ベロシティを記録するWikiページ",
  recordVelocityOn: (name: string) => `Wikiページ「${name}」に記録します。`,
  wikiNotSelected: "Wikiページが指定されていません。",
  selectLabel: "選択する",
  viewOption: "表示オプション",
  hideCompletedPBI: "完了したプロダクトバックログアイテムを非表示にする"
}

const en: typeof ja = {
  issueTypeLabel: "IssueType for product backlog",
  customFieldTitle: "Order of Product Backlog Items",
  customFieldNotExist: "Custom field is not created.",
  createLabel: "Create",
  deleteLabel: "Delete",
  confirmDelete: "Are you willing to delete this custom field and clear all orders of product backlog items?",
  storeOrderOn: (name: string) => `Store data in the field "${name}"`,
  setIssueType: "Please set IssueType first.",
  errorNoRightForCreateCustomField: "You are not authorized to manage a custom attribute.",
  errorInsufficientLicense: "The payment plan of this space doesn't allow to create a custom attribute.",
  creatingIssueType: "Creating a new issue type for PBI.",
  createIssueTypeName: "Name",
  createIssueTypeColor: "Color",
  cancelLabel: "Cancel",
  existing: "Existing",
  velocityTitle: "Wiki to record velocity data",
  recordVelocityOn: (name: string) => `Record data on the wiki page "${name}"`,
  wikiNotSelected: "Wiki page is not selected.",
  selectLabel: "Select",
  viewOption: "View Option",
  hideCompletedPBI: "Hide completed product backlog items"
}

const resources = { ja, en }

export const i18n = (lang: UserLang) => resources[lang]
