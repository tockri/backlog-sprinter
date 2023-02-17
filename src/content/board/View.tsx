import { FormView } from "@/content/board/FormView"
import { useBoardModel } from "@/content/board/Model"
import { BoardEnv } from "@/content/board/types"
import { Loading } from "@/content/ui/Loading"
import { MessageBroker } from "@/util/MessageBroker"
import { Provider } from "jotai"
import React from "react"
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
            <FormView onSuccess={reloadOnMilestoneId} />
          </React.Suspense>
        </Provider>
      </Modal>
    )
  } else {
    return <></>
  }
}

const reloadOnMilestoneId = (milestoneId: number) => {
  const url = new URL(location.href)
  url.searchParams.set("milestone", "" + milestoneId)
  location.href = url.href
}
