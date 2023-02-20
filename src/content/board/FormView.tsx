import { BoardConf, BoardConfState } from "@/content/board/state/BoardConfState"
import { FormState, FormValues } from "@/content/board/state/FormState"
import { BspEnvState } from "@/content/state/BspEnvState"
import { HBox, VBox } from "@/content/ui/Box"
import { Button } from "@/content/ui/Button"
import { ErrorMessage } from "@/content/ui/ErrorMessage"
import { Loading } from "@/content/ui/Loading"
import { TextInput } from "@/content/ui/TextInput"
import { DateUtil } from "@/util/DateUtil"
import styled from "@emotion/styled"
import { useAtom, useAtomValue } from "jotai"
import React from "react"
import { i18n } from "./i18n"

type FormViewProps = {
  onSuccess: (newMilestoneId: number) => void
}

const dateOrNull = (e: { target: { value: string } }) => DateUtil.parseDate(e.target.value)

const id = (suffix: keyof (FormValues & BoardConf)) => `bsp-milestone-${suffix}`

export const FormView: React.FC<FormViewProps> = (props) => {
  const { onSuccess } = props
  const [values, dispatch] = useAtom(FormState.atom)
  const env = useAtomValue(BspEnvState.atom)
  const selectedMilestone = values.selectedMilestone
  const [conf, setConf] = useAtom(BoardConfState.atom)
  const t = i18n(env.lang)

  return (
    <Root>
      <ElementItem>
        <Label htmlFor={id("startDate")}>{t.period}</Label>
        <Row>
          <DateInput
            id={id("startDate")}
            type="date"
            size={10}
            autoComplete="off"
            value={DateUtil.dateString(values.startDate)}
            onChange={(e) => dispatch(FormState.Action.SetStartDate(dateOrNull(e)))}
          />
          <span>&nbsp;〜&nbsp;</span>
          <DateInput
            type="date"
            size={10}
            autoComplete="off"
            min={DateUtil.dateString(values.startDate)}
            value={DateUtil.dateString(values.endDate)}
            onChange={(e) => dispatch(FormState.Action.SetEndDate(dateOrNull(e)))}
          />
        </Row>
      </ElementItem>
      <ElementItem>
        <Label htmlFor={id("title")}>{t.milestoneName}</Label>
        <Row>
          <TextInput
            id={id("title")}
            type="text"
            size={10}
            style={{ flexGrow: 1 }}
            autoComplete="off"
            value={values.title}
            onChange={(e) => dispatch(FormState.Action.SetTitle(e.target.value))}
          />
          <InputFollower>
            <input
              type="checkbox"
              checked={values.titleAuto}
              id={id("titleAuto")}
              className="input-checkbox"
              onChange={(e) => dispatch(FormState.Action.SetTitleAuto(e.target.checked))}
            />
            <CheckboxLabel htmlFor={id("titleAuto")}>{t.auto}</CheckboxLabel>
          </InputFollower>
        </Row>
        {values.sameTitleExists && <ErrorMessage message={t.sameTitleExists} />}
      </ElementItem>
      {selectedMilestone && (
        <ElementItem>
          <FieldSet>
            <Legend>
              {t.selecting} <MilestoneDisplay>{selectedMilestone.name}</MilestoneDisplay>
            </Legend>
            <PlainList>
              <PlainListItem>
                <input
                  type="checkbox"
                  id={id("moveUnclosed")}
                  className="input-checkbox"
                  onChange={(e) =>
                    setConf((c) => {
                      c.moveUnclosed = e.target.checked
                    })
                  }
                  checked={conf.moveUnclosed}
                />
                <CheckboxLabel htmlFor={id("moveUnclosed")}>{t.moveUnclosed}</CheckboxLabel>
              </PlainListItem>
              <PlainListItem>
                <input
                  type="checkbox"
                  id={id("archiveCurrent")}
                  className="input-checkbox"
                  onChange={(e) =>
                    setConf((c) => {
                      c.archiveCurrent = e.target.checked
                    })
                  }
                  checked={conf.archiveCurrent}
                />
                <CheckboxLabel htmlFor={id("archiveCurrent")}>{t.archive}</CheckboxLabel>
              </PlainListItem>
              <PlainListItem>
                <input
                  type="checkbox"
                  id={id("recordVelocity")}
                  className="input-checkbox"
                  onChange={(e) =>
                    setConf((c) => {
                      c.recordVelocity = e.target.checked
                    })
                  }
                  checked={conf.recordVelocity}
                />
                <CheckboxLabel htmlFor={id("recordVelocity")}>{t.recordVelocity}</CheckboxLabel>
              </PlainListItem>
            </PlainList>
          </FieldSet>
        </ElementItem>
      )}
      <div>
        <ButtonBox>
          <Button
            type="button"
            disabled={!values.submittable}
            onClick={() => dispatch(FormState.Action.Submit(onSuccess))}
          >
            {t.submit}
          </Button>
          {values.submitting && (
            <>
              <Loading size="x-small" />
              <SubmittingMessage>
                {t.updating}
                {values.submittingMessage}
              </SubmittingMessage>
            </>
          )}
        </ButtonBox>
        {values.submitErrorMessage && <ErrorMessage message={values.submitErrorMessage} />}
      </div>
    </Root>
  )
}

const Root = styled(VBox)({
  boxSizing: "border-box",
  padding: 20,
  gap: 8,
  " *": {
    boxSizing: "border-box"
  }
})

const ElementItem = styled.div({})

const Row = styled(HBox)({
  justifyContent: "flex-start",
  alignItems: "center"
})

const Label = styled.label({
  margin: "4 0"
})

const CheckboxLabel = styled.label({
  display: "inline-block",
  paddingLeft: 15,
  cursor: "pointer"
})

const DateInput = styled(TextInput)({
  width: "10em"
})

const PlainList = styled.ul({
  paddingLeft: 16
})

const PlainListItem = styled.li({
  listStyle: "none",
  margin: "4px 0"
})

const MilestoneDisplay = styled.span({
  fontWeight: "bold"
})

const InputFollower = styled.div({
  whiteSpace: "nowrap",
  paddingLeft: "1em",
  " *": {
    whiteSpace: "nowrap"
  }
})

const FieldSet = styled.fieldset({
  border: "1px solid silver",
  margin: "0 2px",
  padding: "0.35em 0.625em 0.75em"
})

const Legend = styled.legend({
  padding: "0 0.3em"
})

const ButtonBox = styled(HBox)({
  alignItems: "flex-start",
  justifyContent: "flex-start",
  gap: 12,
  " button": {
    whiteSpace: "nowrap"
  }
})

const SubmittingMessage = styled.div({
  paddingLeft: 6,
  alignSelf: "center"
})
