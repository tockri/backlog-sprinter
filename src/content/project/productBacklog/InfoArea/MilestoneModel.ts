import { useAtomValue, useSetAtom } from "jotai"
import { EditMilestoneInput, Version } from "../../../backlog/ProjectInfoApi"
import { BspEnvState, UserLang } from "../../../state/BspEnvState"
import { MilestonesState } from "../../../state/ProjectInfoState"
import { ItemSelectionState } from "../state/ItemSelectionState"
import { PBIListState } from "../state/PBIListState"

type MilestoneModel = {
  milestone: Version | null
  disallowArchive: boolean
  lang: UserLang
  editMilestone: (key: keyof EditMilestoneInput, value: EditMilestoneInput[typeof key]) => Promise<void>
  archiveMilestone: () => Promise<void>
  isNameDup: (value: string) => boolean
}

export const useMilestoneModel = (): MilestoneModel => {
  const selected = useAtomValue(ItemSelectionState.milestoneAtom)
  const dispatchSelect = useSetAtom(ItemSelectionState.atom)
  const milestone = selected && selected.milestone
  const disallowArchive = selected ? selected.disallowArchive : true
  const dispatch = useSetAtom(PBIListState.atom)
  const milestones = useAtomValue(MilestonesState.atom)
  const { lang } = useAtomValue(BspEnvState.atom)
  return {
    lang,
    milestone,
    disallowArchive,
    editMilestone: async (key, value) => {
      if (milestone) {
        await dispatch(PBIListState.Action.EditMilestone(milestone.projectId, milestone.id, { [key]: value }))
      }
    },
    archiveMilestone: async () => {
      if (milestone) {
        await dispatch(PBIListState.Action.ArchiveMilestone(milestone))
        dispatchSelect(ItemSelectionState.Action.Deselect)
      }
    },
    isNameDup: (value) => !!milestones.find((v) => v.name === value && v.id !== milestone?.id)
  }
}
