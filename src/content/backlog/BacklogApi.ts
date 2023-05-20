import { RealWikiApi } from "@/content/backlog/WikiApi"
import { ObjectUtil } from "@/util/ObjectUtil"
import { RealIssueApi } from "./IssueApi"
import { RealProjectInfoApi } from "./ProjectInfoApi"

export const RealBacklogApi = {
  issue: RealIssueApi,
  projectInfo: RealProjectInfoApi,
  wiki: RealWikiApi
}

export type BacklogApi = typeof RealBacklogApi

export const FakeBacklogApi: BacklogApi = ObjectUtil.convert(RealBacklogApi, (_key, api) => {
  if (typeof api === "object") {
    return ObjectUtil.convert(api, (_key2, func) => {
      if (typeof func === "function") {
        return () => {
          console.warn(`not implemented: ${_key2}`)
          return Promise.reject()
        }
      }
    })
  }
})
