import { FormView } from "@/content/board/FormView"
import { useBoardModel } from "@/content/board/Model"
import { Loading } from "@/content/ui/Loading"
import React from "react"
import { Modal } from "../ui/Modal"
import { i18n } from "./i18n"

export const BoardView: React.FC = () => {
  const model = useBoardModel()
  const { env } = model
  if (env.projectKey) {
    const t = i18n(env.lang)
    return (
      <Modal
        onClose={model.clear}
        size="medium"
        title={t.formTitle}
        height={env?.selectedMilestoneId > 0 ? 450 : undefined}
      >
        <React.Suspense fallback={<Loading />}>
          <FormView onSuccess={reloadOnMilestoneId} />
        </React.Suspense>
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
