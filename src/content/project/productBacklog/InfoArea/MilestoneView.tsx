import styled from "@emotion/styled"
import { useAtomValue, useSetAtom } from "jotai/index"
import React from "react"
import { DateUtil } from "../../../../util/DateUtil"
import { EditMilestoneInput } from "../../../backlog/ProjectInfoApi"
import { BspEnvState } from "../../../state/BspEnvState"
import { MilestonesState } from "../../../state/ProjectInfoState"
import { HBox, VBox } from "../../../ui/Box"
import { Button } from "../../../ui/Button"
import { EditableField } from "../../../ui/EditableField"
import { ItemSelectionState } from "../state/ItemSelectionState"
import { PBIListState } from "../state/PBIListState"
import { i18n } from "./i18n"

export const MilestoneView: React.FC = () => {
  const selected = useAtomValue(ItemSelectionState.milestoneAtom)
  const dispatchSelect = useSetAtom(ItemSelectionState.atom)
  const milestone = selected && selected.milestone
  const disallowArchive = selected ? selected.disallowArchive : true
  const dispatch = useSetAtom(PBIListState.atom)
  const milestones = useAtomValue(MilestonesState.atom)
  const { lang } = useAtomValue(BspEnvState.atom)
  const t = i18n(lang)
  const isNameDup = (value: string) => !!milestones.find((v) => v.name === value && v.id !== milestone?.id)

  if (milestone) {
    const fix = (input: EditMilestoneInput) =>
      dispatch(PBIListState.Action.EditMilestone(milestone.projectId, milestone.id, input))
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
              onFix={(value) => fix({ name: value })}
              errorMessage={(value) => (isNameDup(value) ? t.isNameDup : null)}
              lang={lang}
            />
          </Name>
          <Period>
            <EditableField
              inputType="date"
              inputMax={DateUtil.dateString(DateUtil.parseDate(milestone.releaseDueDate)) || ""}
              blurAction="submit"
              defaultValue={DateUtil.dateString(DateUtil.parseDate(milestone.startDate)) || ""}
              onFix={(value) => fix({ startDate: DateUtil.parseDate(value) })}
              lang={lang}
            />
            ～
            <EditableField
              inputType="date"
              inputMin={DateUtil.dateString(DateUtil.parseDate(milestone.startDate)) || ""}
              blurAction="submit"
              defaultValue={DateUtil.dateString(DateUtil.parseDate(milestone.releaseDueDate)) || ""}
              onFix={(value) => fix({ releaseDueDate: DateUtil.parseDate(value) })}
              lang={lang}
            />
            <ArchiveButtonWrapper>
              <Button
                disabled={disallowArchive}
                onClick={async () => {
                  if (confirm(t.confirmArchive)) {
                    await dispatch(PBIListState.Action.ArchiveMilestone(milestone))
                    dispatchSelect(ItemSelectionState.Action.Deselect)
                  }
                }}
              >
                {t.archive}
              </Button>
            </ArchiveButtonWrapper>
          </Period>

          <Description>
            <EditableField
              defaultValue={milestone.description || ""}
              multiline={true}
              markdown={true}
              blurAction="submit"
              viewStyle={descriptionViewStyle}
              editStyle={descriptionEditStyle}
              onFix={(value) => fix({ description: value })}
              lang={lang}
            />
          </Description>
        </Root>
      )
    )
  } else {
    return <></>
  }
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

const Description = styled(VBox)({
  flexGrow: 1,
  display: "flex",
  alignItems: "stretch",
  lineHeight: 1.3,
  " h1": {
    fontSize: "1.4rem"
  },
  " h2,h3,h4": {
    fontSize: "1.3rem"
  },
  " ul,ol": {
    paddingLeft: "2rem"
  }
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
  lineHeight: 1.3,
  padding: 4,
  height: "100%"
}

const descriptionEditStyle: Style = {
  flexGrow: 1
}
