import { Immutable } from "immer"
import { useAtomValue } from "jotai"
import { projectAtom } from "../app/State"
import { selectedIssueIdAtom } from "./State"

type ProductBacklogModel = Immutable<{
  markdownOnDescription: boolean
  selectedIssueId: number | null
}>

export const useProductBacklogModel = (): ProductBacklogModel => {
  const project = useAtomValue(projectAtom)
  const selectedIssueId = useAtomValue(selectedIssueIdAtom)
  return {
    markdownOnDescription: project.textFormattingRule === "markdown",
    selectedIssueId
  }
}
