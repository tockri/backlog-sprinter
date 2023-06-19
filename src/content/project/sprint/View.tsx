import styled from "@emotion/styled"
import { useAtom, useAtomValue } from "jotai"
import React from "react"
import { DateUtil } from "../../../util/DateUtil"
import { BspEnvState } from "../../state/BspEnvState"
import { HBox, VBox } from "../../ui/Box"
import { Button } from "../../ui/Button"
import { H2 } from "../../ui/H2"
import { Section } from "../../ui/Section"
import { Select } from "../../ui/Select"
import { TextInput } from "../../ui/TextInput"
import { i18n } from "./i18n"
import { FormState, FormValues } from "./state/FormState"
import { SprintConf, SprintConfState } from "./state/SprintConfState"

export const SprintView: React.FC = () => {
  const env = useAtomValue(BspEnvState.atom)
  const [values, dispatch] = useAtom(FormState.atom)
  const [conf, confDispatch] = useAtom(SprintConfState.atom)
  const t = i18n(env.lang)
  const [submittingMessage, setSubmittingMessage] = React.useState("")
  const [createdMilestoneId, setCreatedMilestoneId] = React.useState(0)

  return (
    <Root>
      <VBox>
        <Section>
          <H2>{t.currentSprint}</H2>
          <ElementItem>
            <Select
              id={id("selectedMilestone")}
              onChange={(e) => {
                const value = parseInt(e.target.value || "0") || null
                dispatch(FormState.Action.SelectMilestone(value)).then()
              }}
              value={values.selectedMilestoneId || ""}
            >
              <option value=""></option>
              {values.milestoneOptions.map((ms) => (
                <option value={ms.id} key={ms.id}>
                  {ms.name}
                </option>
              ))}
            </Select>
          </ElementItem>

          {values.selectedMilestone && (
            <HBox>
              <DownArrow />

              <PlainList>
                <PlainListItem>
                  <input
                    type="checkbox"
                    id={id("moveUnclosed")}
                    className="input-checkbox"
                    onChange={(e) => confDispatch({ moveUnclosed: e.target.checked })}
                    checked={conf.moveUnclosed}
                  />
                  <CheckboxLabel htmlFor={id("moveUnclosed")}>{t.moveUnclosed}</CheckboxLabel>
                </PlainListItem>
                <PlainListItem>
                  <input
                    type="checkbox"
                    id={id("archiveCurrent")}
                    className="input-checkbox"
                    onChange={(e) => confDispatch({ archiveCurrent: e.target.checked })}
                    checked={conf.archiveCurrent}
                  />
                  <CheckboxLabel htmlFor={id("archiveCurrent")}>{t.archive}</CheckboxLabel>
                </PlainListItem>
                <PlainListItem>
                  <input
                    type="checkbox"
                    id={id("recordVelocity")}
                    className="input-checkbox"
                    onChange={(e) => confDispatch({ recordVelocity: e.target.checked })}
                    checked={conf.recordVelocity}
                  />
                  <CheckboxLabel htmlFor={id("recordVelocity")}>{t.recordVelocity}</CheckboxLabel>
                </PlainListItem>
              </PlainList>
            </HBox>
          )}
        </Section>

        <Section>
          <H2>{t.nextSprint}</H2>
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
            <Label htmlFor={id("namePrefix")}>{t.milestoneName}</Label>
            <VBox style={{ alignItems: "start" }}>
              <Row>
                <Row
                  style={{
                    padding: 6,
                    borderRadius: 3,
                    border: "1px solid #d0d0d0",
                    borderColor: values.sameTitleExists ? "red" : "#d0d0d0"
                  }}
                >
                  <VBox style={{ marginRight: 4, flexShrink: 1, flexGrow: 0 }}>
                    <div style={{ paddingLeft: 1, overflowY: "hidden", opacity: 0, height: 1, whiteSpace: "nowrap" }}>
                      {conf.namePrefix.replace(/ /g, ".")}
                    </div>
                    <input
                      id={id("namePrefix")}
                      type="text"
                      size={1}
                      style={{
                        padding: 0,
                        borderWidth: "0 0 1px 0",
                        borderStyle: "solid",
                        borderColor: "#e0e0e0",
                        outline: "none"
                      }}
                      autoComplete="off"
                      value={conf.namePrefix}
                      onChange={(e) => dispatch(FormState.Action.SetNamePrefix(e.target.value))}
                    />
                  </VBox>
                  <div style={{ flexGrow: 1 }}>{values.nameSuffix}</div>
                </Row>
                {values.sameTitleExists && <div style={{ marginLeft: 8, color: "red" }}>{t.sameTitleExists}</div>}
              </Row>
            </VBox>
          </ElementItem>
          <ButtonBox>
            <Button
              type="button"
              disabled={!values.submittable}
              onClick={() =>
                dispatch(
                  FormState.Action.Submit({
                    onError: (err) => {
                      console.log({ err })
                    },
                    onProgress: (message) => {
                      setSubmittingMessage(t.progress(message))
                    },
                    onSuccess: (newMilestoneId) => {
                      setSubmittingMessage("")
                      setCreatedMilestoneId(newMilestoneId)
                    }
                  })
                ).then()
              }
            >
              {t.submitButtonLabel}
            </Button>
            <SubmittingMessage>
              {submittingMessage}
              {createdMilestoneId ? (
                <>
                  {t.success}
                  <a href={`/board/${env.projectKey}?milestone=${createdMilestoneId}`}>{t.linkLabel}</a>
                </>
              ) : (
                <></>
              )}
            </SubmittingMessage>
          </ButtonBox>
        </Section>
      </VBox>
    </Root>
  )
}

const id = (suffix: keyof (FormValues & SprintConf)) => `bsp-milestone-${suffix}`

const dateOrNull = (e: { target: { value: string } }) => DateUtil.parseDate(e.target.value)

const Root = styled.div({
  padding: 16,
  height: "100%",
  overflowY: "auto"
})

const ElementItem = styled.div({
  marginBottom: 16
})

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

const DownArrow = styled.div({
  position: "relative",
  width: 40,
  marginLeft: 20,
  marginRight: 10,
  backgroundColor: "#e0e0e0",
  "&:after": {
    position: "absolute",
    content: "''",
    top: "100%",
    left: -20,
    width: 80,
    height: 25,
    backgroundColor: "#e0e0e0",
    clipPath: "polygon(0 0, 100% 0, 50% 100%)"
  }
})
