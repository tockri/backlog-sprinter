import React, { useEffect } from "react"
import { DateUtil } from "../../../util/DateUtil"
import { MilestonesData } from "../../backlog/ProjectInfo"
import { i18n } from "../i18n"
import { MilestoneFormInfo } from "../types"
import { Actions } from "./Actions"
import { ReducerFunc, Reducers, ViewState } from "./Reducers"
import { StorageSystem } from "./Storage"

type MilestoneFormProps = {
  formInfo: MilestoneFormInfo
  projectInfo: MilestonesData
  onSuccess: (newMilestoneId: number) => void
}

const dateOrNull = (e: { target: { value: string } }) => DateUtil.parseDate(e.target.value)

const id = (suffix: keyof ViewState) => `bsp-milestone-${suffix}`

export const MilestoneForm: React.FC<MilestoneFormProps> = (props) => {
  const { formInfo, projectInfo, onSuccess } = props
  const [state, dispatch] = React.useReducer<ReducerFunc, void>(Reducers.reduceState(projectInfo), void 0, () => {
    const loaded = StorageSystem.load()
    return Reducers.makeInitialState(formInfo.selectedMilestoneId, projectInfo, loaded)
  })

  const t = i18n(formInfo.lang)

  const toSave = StorageSystem.extract(state)
  useEffect(() => {
    StorageSystem.save(toSave)
  }, [toSave])

  const onSubmit = async () => {
    if (state.submittable) {
      const submitting = (submitting: boolean, submitErrorMessage: string | null, submittingMessage: string | null) => {
        dispatch({ src: "submit", submitting, submitErrorMessage, submittingMessage })
      }
      submitting(true, null, null)
      const result = await Actions.submitForm(state, projectInfo, (issue) => {
        submitting(true, null, `${t.updating}${issue.issueKey} ${issue.summary}`)
      })
      if (result.errorMessage) {
        submitting(false, result.errorMessage, null)
      } else if (result.createdMilestoneId) {
        onSuccess(result.createdMilestoneId)
      }
    }
  }

  return (
    <div className="modal__content">
      <div className="form-element__item">
        <label className="form-element__label" htmlFor={id("startDate")}>
          {t.period}
        </label>
        <div className="bsp-row">
          <input
            id={id("startDate")}
            type="date"
            size={10}
            className="input-text bsp-dateInput"
            autoComplete="off"
            value={DateUtil.dateString(state.startDate)}
            onChange={(e) => dispatch({ src: "startDate", value: dateOrNull(e) })}
          />
          <span>&nbsp;〜&nbsp;</span>
          <input
            type="date"
            size={10}
            className="input-text bsp-dateInput"
            autoComplete="off"
            value={DateUtil.dateString(state.endDate)}
            onChange={(e) => dispatch({ src: "endDate", value: dateOrNull(e) })}
          />
        </div>
      </div>
      <div className="form-element__item">
        <label className="form-element__label" htmlFor={id("title")}>
          {t.milestoneName}
        </label>
        <div className="bsp-row">
          <input
            id={id("title")}
            type="text"
            size={10}
            className="input-text"
            autoComplete="off"
            value={state.title}
            onChange={(e) => dispatch({ src: "title", value: e.target.value })}
          />
          <div className="bsp-input-follower">
            <input
              type="checkbox"
              checked={state.titleAuto}
              id={id("titleAuto")}
              className="input-checkbox"
              onChange={(e) => dispatch({ src: "titleAuto", value: e.target.checked })}
            />
            <label htmlFor={id("titleAuto")} className="checkboxLabel">
              {t.auto}
            </label>
          </div>
        </div>
        {state.sameTitleExists && (
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
      {state.selectedMilestone && (
        <div className="form-element__item">
          <fieldset>
            <legend>
              {t.selecting} <span className="bsp-selected-milestone">{state.selectedMilestone.name}</span>
            </legend>
            <ul className="bsp-plain-list">
              <li>
                <div className="form-element__item">
                  <input
                    type="checkbox"
                    id={id("moveUnclosed")}
                    className="input-checkbox"
                    onChange={(e) => dispatch({ src: "moveUnclosed", value: e.target.checked })}
                    checked={state.moveUnclosed}
                  />
                  <label htmlFor={id("moveUnclosed")} className="checkboxLabel">
                    {t.moveUnclosed}
                  </label>
                </div>
              </li>
              <li>
                <div className="form-element__item">
                  <input
                    type="checkbox"
                    id={id("archiveCurrent")}
                    className="input-checkbox"
                    onChange={(e) => dispatch({ src: "archiveCurrent", value: e.target.checked })}
                    checked={state.archiveCurrent}
                  />
                  <label htmlFor={id("archiveCurrent")} className="checkboxLabel">
                    {t.archive}
                  </label>
                </div>
              </li>
            </ul>
          </fieldset>
        </div>
      )}
      <div>
        <div className="bsp-row --spacing">
          <button type="button" disabled={!state.submittable} className="button button--primary" onClick={onSubmit}>
            {t.submit}
          </button>
          {state.submitting && <div className="loading--circle -small"></div>}
          <div className="bsp-submitting-message">{state.submittingMessage}</div>
        </div>
        {state.submitErrorMessage && (
          <div className="message message--error _mg-b-15">
            <span className="message__icon">
              <svg role="image" className="icon -medium">
                <use xlinkHref="/images/svg/sprite.symbol.svg#icon_alert"></use>
              </svg>
            </span>
            <div className="message__content">{state.submitErrorMessage}</div>
          </div>
        )}
      </div>
    </div>
  )
}
