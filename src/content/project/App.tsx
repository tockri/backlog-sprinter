import React, { useEffect } from "react"
import { MessageBroker } from "../../util/MessageBroker"
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
    broker.subscribe("Project", (formInfo) => setState((curr) => ({ ...curr, formInfo })))
    return () => {
      broker.unsubscribe("Project")
    }
  }, [broker])
  if (formInfo) {
    return (
      <div>
        Project {formInfo.lang} {formInfo.projectKey}
      </div>
    )
  } else {
    return <></>
  }
}
