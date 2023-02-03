import styled from "@emotion/styled"
import React from "react"
import { DateUtil } from "../../../../util/DateUtil"
import { HBox, VBox } from "../../../ui/Box"
import { Button } from "../../../ui/Button"
import { TextInput } from "../../../ui/TextInput"
import { i18n } from "../i18n"
import { useMilestoneModel } from "./MilestoneModel"

export const MilestoneForm: React.FC<{ milestoneId?: number }> = ({ milestoneId }) => {
  const model = useMilestoneModel(milestoneId)
  const { values, lang, submittable } = model
  const t = i18n(lang)
  return (
    <Root>
      <VBox style={{ flexGrow: 1 }}>
        <label>{t.milestoneName}</label>
        <TextInput
          type="text"
          value={values.name}
          onChange={(e) => {
            model.setName(e.target.value)
          }}
        />
        {values.errorMessage && <Error>{values.errorMessage}</Error>}
      </VBox>
      <VBox>
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
      </VBox>
      <Buttons>
        <Button onClick={() => model.cancel()}>Cancel</Button>
        <Button onClick={() => model.submit()} disabled={!submittable}>
          Submit
        </Button>
      </Buttons>
    </Root>
  )
}

const Root = styled(HBox)({
  margin: 12,
  gap: 4,
  flexWrap: "wrap",
  alignItems: "center"
})

const Buttons = styled(HBox)({
  marginTop: 8,
  gap: 8,
  alignItems: "center",
  flexShrink: 1
})

const Error = styled.div({
  color: "#ff4444",
  fontSize: "0.9em"
})
