import styled from "@emotion/styled"
import { useAtomValue, useSetAtom } from "jotai"
import React from "react"
import { Tooltip } from "react-tooltip"
import { DateUtil } from "../../../../util/DateUtil"
import { AddMilestoneInput, Version } from "../../../backlog/ProjectInfoApi"
import { BspEnvState } from "../../../state/BspEnvState"
import { MilestonesState } from "../../../state/ProjectInfoState"
import { HBox, VBox } from "../../../ui/Box"
import { Button } from "../../../ui/Button"
import { cnu } from "../../../ui/cnu"
import { TextArea, TextInput } from "../../../ui/TextInput"
import { ItemSelectionState } from "../state/ItemSelectionState"
import { PBIListState } from "../state/PBIListState"
import { i18n } from "./i18n"

export const AddMilestoneFormView: React.FC = () => {
  const { lang } = useAtomValue(BspEnvState.atom)
  const [values, setValues] = React.useState<AddMilestoneInput>({
    name: "",
    description: "",
    startDate: null,
    releaseDueDate: null
  })
  const milestones = useAtomValue(MilestonesState.atom)
  const selDispatch = useSetAtom(ItemSelectionState.atom)
  const pbDispatch = useSetAtom(PBIListState.atom)
  const submittable = isSubmittable(values, milestones)
  const isNameDup = !!values.name && !!milestones.find((ms) => ms.name === values.name)
  const cancel = () => {
    selDispatch(ItemSelectionState.Action.Deselect)
  }
  const submit = async () => {
    await pbDispatch(PBIListState.Action.AddMilestone(values))
    selDispatch(ItemSelectionState.Action.Deselect)
  }

  const t = i18n(lang)
  return (
    <Root>
      <H2>{t.addMilestone}</H2>
      <TextInput
        id="add-milestone-name"
        data-tooltip-content={isNameDup ? t.isNameDup : ""}
        value={values.name}
        onChange={(e) => setValues((curr) => ({ ...curr, name: e.target.value }))}
        placeholder={t.milestoneName}
        required={true}
        className={cnu({ error: isNameDup })}
      />
      {isNameDup && <Tooltip anchorId="add-milestone-name" place="bottom" />}
      <Period>
        <TextInput
          type="date"
          value={DateUtil.dateString(values.startDate)}
          onChange={(e) => setValues((curr) => ({ ...curr, startDate: DateUtil.parseDate(e.target.value) }))}
          required={true}
        />
        ～
        <TextInput
          type="date"
          value={DateUtil.dateString(values.releaseDueDate)}
          onChange={(e) => setValues((curr) => ({ ...curr, releaseDueDate: DateUtil.parseDate(e.target.value) }))}
          min={values.startDate ? DateUtil.dateString(values.startDate) : ""}
          required={true}
        />
      </Period>
      <TextArea
        value={values.description}
        onChange={(e) => setValues((curr) => ({ ...curr, description: e.target.value }))}
        style={{
          flexGrow: 1
        }}
        placeholder={t.milestoneDescription}
      />
      <Buttons>
        <Button onClick={cancel}>{t.cancel}</Button>
        <Button onClick={submit} disabled={!submittable}>
          {t.submitForm}
        </Button>
      </Buttons>
    </Root>
  )
}

const isSubmittable = (values: AddMilestoneInput, milestones: ReadonlyArray<Version>): boolean => {
  const { name, startDate, releaseDueDate } = values
  return !!(
    name &&
    startDate &&
    releaseDueDate &&
    startDate.getTime() <= releaseDueDate.getTime() &&
    !milestones.find((ms) => ms.name === name)
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

const H2 = styled.h2({
  fontSize: 16,
  padding: "4px 0",
  fontWeight: "normal",
  margin: 0
})

const Period = styled(HBox)({
  flexGrow: 0,
  gap: 4,
  alignItems: "center"
})

const Buttons = styled(HBox)({
  flexGrow: 0,
  gap: 12
})
