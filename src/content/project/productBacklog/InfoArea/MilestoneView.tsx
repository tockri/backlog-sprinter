import { Button } from "@/content/ui/Button"
import { DateUtil } from "@/util/DateUtil"
import styled from "@emotion/styled"
import React from "react"
import { HBox, VBox } from "../../../ui/Box"
import { EditableField } from "../../../ui/EditableField"
import { i18n } from "./i18n"
import { useMilestoneModel } from "./MilestoneModel"

export const MilestoneView: React.FC = () => {
  const model = useMilestoneModel()
  const { milestone, lang, disallowArchive } = model
  const t = i18n(lang)
  return (
    milestone && (
      <Root>
        <Name>
          🏁
          <EditableField
            defaultValue={milestone.name}
            viewStyle={nameViewStyle}
            editStyle={nameEditStyle}
            blurAction="submit"
            onFix={(value) => {
              model.editMilestone("name", value).then()
            }}
            errorMessage={(value) => (model.isNameDup(value) ? t.isNameDup : null)}
            lang={lang}
          />
        </Name>
        <Period>
          <EditableField
            inputType="date"
            inputMax={DateUtil.dateString(DateUtil.parseDate(milestone.releaseDueDate)) || ""}
            blurAction="submit"
            defaultValue={DateUtil.dateString(DateUtil.parseDate(milestone.startDate)) || ""}
            onFix={(value) => {
              const date = DateUtil.parseDate(value)
              if (date) {
                model.editMilestone("startDate", date).then()
              }
            }}
            lang={lang}
          />
          ～
          <EditableField
            inputType="date"
            inputMin={DateUtil.dateString(DateUtil.parseDate(milestone.startDate)) || ""}
            blurAction="submit"
            defaultValue={DateUtil.dateString(DateUtil.parseDate(milestone.releaseDueDate)) || ""}
            onFix={(value) => {
              const date = DateUtil.parseDate(value)
              if (date) {
                model.editMilestone("releaseDueDate", date).then()
              }
            }}
            lang={lang}
          />
          <ArchiveButtonWrapper>
            <Button
              disabled={disallowArchive}
              onClick={() => {
                if (confirm(t.confirmArchive)) {
                  model.archiveMilestone().then()
                }
              }}
            >
              {t.archive}
            </Button>
          </ArchiveButtonWrapper>
        </Period>

        <EditableField
          defaultValue={milestone.description || ""}
          multiline={true}
          blurAction="submit"
          viewStyle={descriptionViewStyle}
          editStyle={descriptionEditStyle}
          onFix={(value) => {
            model.editMilestone("description", value).then()
          }}
          lang={lang}
        />
      </Root>
    )
  )
}
const Root = styled(VBox)({
  boxSizing: "border-box",
  padding: 8,
  boxShadow: "-2px 0 3px #c0c0c0",
  height: "calc(100% - 12px)",
  margin: 12,
  gap: 8
})

const Name = styled(HBox)({
  flexGrow: 0,
  height: 24,
  alignItems: "center"
})

const Period = styled(HBox)({
  flexGrow: 0,
  gap: 8,
  height: 24,
  alignItems: "center"
})

const ArchiveButtonWrapper = styled.div({
  flexGrow: 1,
  textAlign: "right"
})

type Style = React.CSSProperties

const nameViewStyle: Style = {
  fontWeight: "bold",
  flexGrow: 1
}

const nameEditStyle: Style = {
  flexGrow: 1
}

const descriptionViewStyle: Style = {
  flexGrow: 1,
  backgroundColor: "#f0f0f0",
  borderRadius: 4,
  whiteSpace: "pre-wrap",
  lineHeight: 1.3,
  padding: 4
}

const descriptionEditStyle: Style = {
  flexGrow: 1
}
