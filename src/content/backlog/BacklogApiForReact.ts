import { RealWikiApi, WikiApi } from "@/content/backlog/WikiApi"
import { ObjectUtil } from "@/util/ObjectUtil"
import { Immutable } from "immer"
import React from "react"
import { IssueApi, RealIssueApi } from "./IssueApi"
import { ProjectInfoApi, RealProjectInfoApi } from "./ProjectInfoApi"

export type BacklogApi = Immutable<{
  issue: IssueApi
  projectInfo: ProjectInfoApi
  wiki: WikiApi
}>

const rejectFunc = (name: string) => () => {
  console.warn(`not implemented: ${name}`)
  return Promise.reject()
}

const toFake = <T>(obj: T): T => {
  const ret: Record<string, unknown> = {}
  if (ObjectUtil.isRecord(obj)) {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === "function") {
        ret[key] = rejectFunc(key)
      }
    })
    return ret as T
  } else {
    throw new Error("cannot produce")
  }
}

const fakeIssueApi: IssueApi = toFake(RealIssueApi)

const fakeProjectInfoApi: ProjectInfoApi = toFake(RealProjectInfoApi)

const fakeWikiApi: WikiApi = toFake(RealWikiApi)

export const FakeBacklogApi: BacklogApi = {
  issue: fakeIssueApi,
  projectInfo: fakeProjectInfoApi,
  wiki: fakeWikiApi
}

export const RealBacklogApi: BacklogApi = {
  issue: RealIssueApi,
  projectInfo: RealProjectInfoApi,
  wiki: RealWikiApi
}

export const BacklogApiContext = React.createContext<BacklogApi>(FakeBacklogApi)
