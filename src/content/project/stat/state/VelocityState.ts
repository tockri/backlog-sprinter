import { BacklogApi } from "@/content/backlog/BacklogApiForReact"
import { Issue } from "@/content/backlog/IssueApi"
import { Project } from "@/content/backlog/ProjectInfoApi"
import { DateUtil } from "@/util/DateUtil"

const collectIssues = async (api: BacklogApi, project: Project, pbiIssueTypeId: number) => {
  const since = DateUtil.beginningOfDay(DateUtil.addDays(new Date(), -7))

  const issues = await api.issue.searchClosed(project, since)
  const pbis = issues.filter((issue) => issue.issueType.id === pbiIssueTypeId)
  const others = issues.filter((issue) => issue.issueType.id !== pbiIssueTypeId)
  return { pbis, others }
}

const calcVelocity = (issues: ReadonlyArray<Issue>): number =>
  issues.reduce((acc, issue) => acc + (issue.actualHours || issue.estimatedHours || 1), 0)

const loadData = async (api: BacklogApi, project: Project, wikiId: number) => {}
