import { FormView } from "@/content/board/FormView"
import { useBoardModel } from "@/content/board/Model"
import { BoardEnv } from "@/content/board/types"
import { Loading } from "@/content/ui/Loading"
import { Provider } from "jotai"
import React from "react"
import { MessageBroker } from "../../util/MessageBroker"
import { Modal } from "../ui/Modal"
import { i18n } from "./i18n"

type BoardProps = {
  broker: MessageBroker<BoardEnv>
}

export const BoardView: React.FC<BoardProps> = (props) => {
  const model = useBoardModel(props.broker)
  const { env } = model
  if (env) {
    const t = i18n(env.lang)
    return (
      <Modal
        onClose={model.clear}
        size="medium"
        title={t.formTitle}
        height={env?.selectedMilestoneId > 0 ? 450 : undefined}
      >
        <Provider store={model.jotaiStore}>
          <React.Suspense fallback={<Loading />}>
            <FormView
              onSuccess={(newMilestoneId) => {
                console.log({ newMilestoneId })
              }}
            />
          </React.Suspense>
        </Provider>
      </Modal>
    )
  } else {
    return <></>
  }
}

const Inner: React.FC = () => {
  return <div>Inner.</div>
}
