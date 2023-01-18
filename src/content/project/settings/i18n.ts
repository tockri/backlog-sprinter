import { UserLang } from "../types"

const ja = {
  issueTypeLabel: "プロダクトバックログを表す課題種別",
  customFieldTitle: "プロダクトバックログの順序",
  customFieldNotExist: "カスタム属性が作られていません。",
  createLabel: "作る",
  deleteLabel: "削除する",
  confirmDelete: "このカスタム属性を削除するとプロダクトバックログの並び順がクリアされます。よろしいですか？",
  storeOrderOn: (name: string) => `カスタム属性「${name}」に格納します。`,
  setIssueType: "まず課題種別を決めてください。"
}

const en: typeof ja = {
  issueTypeLabel: "IssueType for product backlog",
  customFieldTitle: "Order of Product Backlog Items",
  customFieldNotExist: "Custom field is not created.",
  createLabel: "Create",
  deleteLabel: "Delete",
  confirmDelete: "Are you willing to delete this custom field and clear all orders of product backlog items?",
  storeOrderOn: (name: string) => `Store data in the field "${name}"`,
  setIssueType: "Please set IssueType first."
}

const resources = { ja, en }

export const i18n = (lang: UserLang) => resources[lang]
