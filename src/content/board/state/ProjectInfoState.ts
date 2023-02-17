import { atom } from "jotai"

import { ApiState } from "@/content/state/ApiState"

import { JotaiUtil } from "@/content/util/JotaiUtil"
import { EnvState } from "./EnvState"

const projectInfoAtom = atom(async (get) => {
  const env = get(EnvState.atom)
  const api = get(ApiState.atom)
  return await api.projectInfo.getProjectInfoWithMilestones(env.projectKey)
})
const projectAtom = JotaiUtil.asyncAtomFromParent(projectInfoAtom, (pi) => pi.project)
const statusesAtom = JotaiUtil.asyncAtomFromParent(projectInfoAtom, (pi) => pi.statuses)
const milestonesAtom = JotaiUtil.asyncAtomFromParent(projectInfoAtom, (pi) => pi.milestones)

export const ProjectState = {
  atom: projectAtom
}

export const StatusesState = {
  atom: statusesAtom
}

export const MilestonesState = {
  atom: milestonesAtom
}
