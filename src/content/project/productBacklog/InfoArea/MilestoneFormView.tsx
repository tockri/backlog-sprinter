import styled from "@emotion/styled"
import React from "react"
import { DateUtil } from "../../../../util/DateUtil"
import { HBox, VBox } from "../../../ui/Box"
import { Button } from "../../../ui/Button"
import { TextArea, TextInput } from "../../../ui/TextInput"
import { i18n } from "./i18n"
import { useMilestoneFormModel } from "./MilestoneFormModel"

export const MilestoneFormView: React.FC = () => {
  const model = React.useCallback(useMilestoneFormModel, [])()
  const { lang, values, submittable } = model
  const t = i18n(lang)
  return (
    <Root>
      <H2>{t.addMilestone}</H2>
      <TextInput
        value={values.name}
        onChange={(e) => {
          model.setName(e.target.value)
        }}
        placeholder={t.milestoneName}
      />
      <Period>
        <TextInput
          type="date"
          value={DateUtil.dateString(values.startDate)}
          onChange={(e) => {
            model.setStartDate(e.target.value)
          }}
        />
        ～
        <TextInput
          type="date"
          value={DateUtil.dateString(values.releaseDueDate)}
          onChange={(e) => {
            model.setReleaseDueDate(e.target.value)
          }}
        />
      </Period>
      <TextArea
        value={values.description}
        onChange={(e) => {
          model.setDescription(e.target.value)
        }}
        style={{
          flexGrow: 1
        }}
        placeholder={t.milestoneDescription}
      />
      <Buttons>
        <Button onClick={model.cancel}>Cancel</Button>
        <Button onClick={model.submit} disabled={!submittable}>
          Submit
        </Button>
      </Buttons>
    </Root>
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
