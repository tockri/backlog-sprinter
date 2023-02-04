import { useAtomValue, useSetAtom } from "jotai"
import { EditMilestoneInput, Version } from "../../../backlog/ProjectInfo"
import { Environment } from "../../app/state/Environment"
import { UserLang } from "../../types"
import { ProductBacklog } from "../state/ProductBacklog"
import { SelectedItem } from "../state/SelectedItem"

type MilestoneModel = {
  milestone: Version | null
  lang: UserLang
  editMilestone: (key: keyof EditMilestoneInput, value: EditMilestoneInput[typeof key]) => Promise<void>
}

export const useMilestoneModel = (): MilestoneModel => {
  const milestone = useAtomValue(SelectedItem.milestoneAtom)
  const dispatch = useSetAtom(ProductBacklog.atom)
  const { lang } = useAtomValue(Environment.atom)
  return {
    lang,
    milestone,
    editMilestone: async (key, value) => {
      if (milestone) {
        dispatch(ProductBacklog.Action.EditMilestone(milestone.projectId, milestone.id, { [key]: value }))
      }
    }
  }
}
