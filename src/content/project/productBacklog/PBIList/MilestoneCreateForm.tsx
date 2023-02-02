import styled from "@emotion/styled"
import { useAtom } from "jotai"
import React from "react"
import { DateUtil } from "../../../../util/DateUtil"
import { TextInput } from "../../../ui/TextInput"
import { MilestoneCreate, milestoneCreateFormAtom } from "./State"

export const MilestoneCreateForm: React.FC = () => {
  const [values, dispatch] = useAtom(milestoneCreateFormAtom)
  return (
    <Root>
      <div>
        name:
        <TextInput
          type="text"
          value={values.name}
          onChange={(e) => {
            dispatch(MilestoneCreate.SetName(e.target.value))
          }}
        />
      </div>
      <div>
        start date:
        <TextInput
          type="date"
          value={DateUtil.dateString(values.startDate)}
          onChange={(e) => {
            dispatch(MilestoneCreate.SetStartDate(e.target.value))
          }}
        />
      </div>
      <div>
        end date:
        <TextInput
          type="date"
          value={DateUtil.dateString(values.endDate)}
          onChange={(e) => {
            dispatch(MilestoneCreate.SetEndDate(e.target.value))
          }}
        />
      </div>
      <div>
        <button onClick={() => dispatch(MilestoneCreate.Cancel)}>Cancel</button>
        <button onClick={() => dispatch(MilestoneCreate.Submit)}>Submit</button>
      </div>
    </Root>
  )
}

const Root = styled.div({
  margin: 12
})
