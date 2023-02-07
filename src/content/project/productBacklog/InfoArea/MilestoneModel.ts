import { useAtomValue, useSetAtom } from "jotai"
import { EditMilestoneInput, Version } from "../../../backlog/ProjectInfo"
import { EnvState } from "../../app/state/EnvState"
import { UserLang } from "../../types"
import { ItemSelectionState } from "../state/ItemSelectionState"
import { PBIListState } from "../state/PBIListState"

type MilestoneModel = {
  milestone: Version | null
  lang: UserLang
  editMilestone: (key: keyof EditMilestoneInput, value: EditMilestoneInput[typeof key]) => Promise<void>
}

export const useMilestoneModel = (): MilestoneModel => {
  const milestone = useAtomValue(ItemSelectionState.milestoneAtom)
  const dispatch = useSetAtom(PBIListState.atom)
  const { lang } = useAtomValue(EnvState.atom)
  return {
    lang,
    milestone,
    editMilestone: async (key, value) => {
      if (milestone) {
        dispatch(PBIListState.Action.EditMilestone(milestone.projectId, milestone.id, { [key]: value }))
      }
    }
  }
}
