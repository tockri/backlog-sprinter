import styled from "@emotion/styled"
import React from "react"
import { DateUtil } from "../../../../util/DateUtil"
import { HBox, VBox } from "../../../ui/Box"
import { Button } from "../../../ui/Button"
import { TextInput } from "../../../ui/TextInput"
import { i18n } from "../i18n"
import { useMilestoneCreateModel } from "./MilestoneCreateModel"

export const MilestoneCreateForm: React.FC = () => {
  const model = useMilestoneCreateModel()
  const { values, lang } = model
  const t = i18n(lang)
  return (
    <Root>
      <label>{t.milestoneName}</label>
      <TextInput
        type="text"
        value={values.name}
        onChange={(e) => {
          model.setName(e.target.value)
        }}
      />
      <label>{t.milestonePeriod}</label>
      <HBox>
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
          value={DateUtil.dateString(values.endDate)}
          onChange={(e) => {
            model.setEndDate(e.target.value)
          }}
        />
      </HBox>
      <Buttons>
        <Button onClick={() => model.submit()}>Submit</Button>
        <Button onClick={() => model.cancel()}>Cancel</Button>
      </Buttons>
    </Root>
  )
}

const Root = styled(VBox)({
  margin: 12,
  gap: 4
})

const Buttons = styled(HBox)({
  marginTop: 8,
  gap: 8
})
