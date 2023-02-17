import { Conf, ConfState } from "@/content/board/state/ConfState"
import { EnvState } from "@/content/board/state/EnvState"
import { FormState, FormValues } from "@/content/board/state/FormState"
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

const id = (suffix: keyof (FormValues & Conf)) => `bsp-milestone-${suffix}`

export const FormView: React.FC<FormViewProps> = (props) => {
  const { onSuccess } = props
  const [values, dispatch] = useAtom(FormState.atom)
  const env = useAtomValue(EnvState.atom)
  const [conf, setConf] = useAtom(ConfState.atom)
  const t = i18n(env.lang)

  return (
    <div className="modal__content">
      <div className="form-element__item">
        <label className="form-element__label" htmlFor={id("startDate")}>
          {t.period}
        </label>
        <Row>
          <DateInput
            id={id("startDate")}
            type="date"
            size={10}
            className="input-text"
            autoComplete="off"
            value={DateUtil.dateString(values.startDate)}
            onChange={(e) => dispatch(FormState.Action.SetStartDate(dateOrNull(e)))}
          />
          <span>&nbsp;〜&nbsp;</span>
          <DateInput
            type="date"
            size={10}
            className="input-text"
            autoComplete="off"
            min={DateUtil.dateString(values.startDate)}
            value={DateUtil.dateString(values.endDate)}
            onChange={(e) => dispatch(FormState.Action.SetEndDate(dateOrNull(e)))}
          />
        </Row>
      </div>
      <div className="form-element__item">
        <label className="form-element__label" htmlFor={id("title")}>
          {t.milestoneName}
        </label>
        <Row>
          <TextInput
            id={id("title")}
            type="text"
            size={10}
            className="input-text"
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
            <label htmlFor={id("titleAuto")} className="checkboxLabel">
              {t.auto}
            </label>
          </InputFollower>
        </Row>
        {values.sameTitleExists && (
          <div className="message message--error _mg-b-15">
            <span className="message__icon">
              <svg role="image" className="icon -medium">
                <use xlinkHref="/images/svg/sprite.symbol.svg#icon_alert"></use>
              </svg>
            </span>
            <div className="message__content">{t.sameTitleExists}</div>
          </div>
        )}
      </div>
      {values.selectedMilestone && (
        <div className="form-element__item">
          <fieldset>
            <legend>
              {t.selecting} <MilestoneDisplay>{values.selectedMilestone.name}</MilestoneDisplay>
            </legend>
            <PlainList>
              <PlainListItem>
                <div className="form-element__item">
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
                  <label htmlFor={id("moveUnclosed")} className="checkboxLabel">
                    {t.moveUnclosed}
                  </label>
                </div>
              </PlainListItem>
              <PlainListItem>
                <div className="form-element__item">
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
                  <label htmlFor={id("archiveCurrent")} className="checkboxLabel">
                    {t.archive}
                  </label>
                </div>
              </PlainListItem>
            </PlainList>
          </fieldset>
        </div>
      )}
      <div>
        <Row className="--spacing">
          <button
            type="button"
            disabled={!values.submittable}
            className="button button--primary"
            onClick={() => dispatch(FormState.Action.Submit(onSuccess))}
          >
            {t.submit}
          </button>
          {values.submitting && (
            <>
              <div className="loading--circle -small"></div>
              <SubmittingMessage>
                {t.updating}
                {values.submittingMessage}
              </SubmittingMessage>
            </>
          )}
        </Row>
        {values.submitErrorMessage && (
          <div className="message message--error _mg-b-15">
            <span className="message__icon">
              <svg role="image" className="icon -medium">
                <use xlinkHref="/images/svg/sprite.symbol.svg#icon_alert"></use>
              </svg>
            </span>
            <div className="message__content">{values.submitErrorMessage}</div>
          </div>
        )}
      </div>
    </div>
  )
}

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  &.--spacing {
    column-gap: 1em;
  }
`

const DateInput = styled.input`
  width: 10em;
`

const PlainList = styled.ul`
  padding-left: 16px;
`

const PlainListItem = styled.li`
  list-style: none;
`

const MilestoneDisplay = styled.span`
  font-weight: bold;
`
const SubmittingMessage = styled.div`
  padding: 6px 0;
`

const InputFollower = styled.div`
  white-space: nowrap;
  padding-left: 1em;
  label {
    white-space: nowrap;
  }
`
