import { UserLang } from "@/content/types"
import { useAtomValue, useSetAtom } from "jotai"
import { EditMilestoneInput, Version } from "../../../backlog/ProjectInfoApi"
import { EnvState } from "../../../state/EnvState"
import { MilestonesState } from "../../../state/ProjectInfoState"
import { ItemSelectionState } from "../state/ItemSelectionState"
import { PBIListState } from "../state/PBIListState"

type MilestoneModel = {
  milestone: Version | null
  lang: UserLang
  editMilestone: (key: keyof EditMilestoneInput, value: EditMilestoneInput[typeof key]) => Promise<void>
  isNameDup: (value: string) => boolean
}

export const useMilestoneModel = (): MilestoneModel => {
  const milestone = useAtomValue(ItemSelectionState.milestoneAtom)
  const dispatch = useSetAtom(PBIListState.atom)
  const milestones = useAtomValue(MilestonesState.atom)
  const { lang } = useAtomValue(EnvState.atom)
  return {
    lang,
    milestone,
    editMilestone: async (key, value) => {
      if (milestone) {
        dispatch(PBIListState.Action.EditMilestone(milestone.projectId, milestone.id, { [key]: value }))
      }
    },
    isNameDup: (value) => !!milestones.find((v) => v.name === value && v.id !== milestone?.id)
  }
}
