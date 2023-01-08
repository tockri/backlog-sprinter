import React, { useEffect } from "react"
import { MessageBroker } from "../../util/MessageBroker"
import { Modal } from "../ui/Modal"
import { i18n } from "./i18n"
import { PBFormInfo } from "./types"

type ProjectAppProps = {
  broker: MessageBroker<PBFormInfo>
}

type State = {
  formInfo: PBFormInfo | null
}

export const ProjectApp: React.FC<ProjectAppProps> = (props) => {
  const { broker } = props
  const [state, setState] = React.useState<State>({ formInfo: null })
  const { formInfo } = state
  useEffect(() => {
    broker.subscribe("Project", (formInfo) => setState((s) => ({ ...s, formInfo })))
    return () => {
      broker.unsubscribe("Project")
    }
  }, [broker])
  if (formInfo) {
    const t = i18n(formInfo.lang)
    return (
      <Modal onCloseEvent={() => setState((s) => ({ ...s, formInfo: null }))} size="medium" title={t.formTitle}>
        <div className="modal__content">もーだる！</div>
      </Modal>
    )
  } else {
    return <></>
  }
}
