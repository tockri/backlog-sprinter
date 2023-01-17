import React from "react"
import { useProjectSettingsViewModel } from "./ViewModel"

export const ProjectSettings: React.FC = () => {
  const vm = useProjectSettingsViewModel()
  const settings = vm.settings
  const id = (key: string) => `project.settingsForm.${key}`
  return (
    <div>
      <div className="form-element__item">
        <label className="form-element__label" htmlFor={id("issueType")}>
          プロダクトバックログを表す課題種別
        </label>
        <select
          id={id("issueType")}
          onChange={(e) => {
            const elem = e.currentTarget
            if (elem.selectedIndex > 0) {
              const issueType = vm.issueTypes[elem.selectedIndex - 1]
              vm.selectIssueType(issueType.id)
            }
          }}
          value={settings.pbiIssueTypeId || ""}
        >
          <option value=""></option>
          {vm.issueTypes.map((it) => (
            <option key={it.id} value={it.id}>
              {it.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-element__item">
        <label className="form-element__label" htmlFor={id("customField")}>
          プロダクトバックログの順序
        </label>
        {settings.pbiIssueTypeId ? (
          vm.orderCustomField ? (
            <div>カスタム属性「{vm.orderCustomField.name}」に格納します。</div>
          ) : (
            <div>
              カスタム属性が作られていません。
              <button onClick={() => vm.createCustomField()}>作る</button>
            </div>
          )
        ) : (
          <div>まず課題種別を決めてください</div>
        )}
      </div>
    </div>
  )
}
