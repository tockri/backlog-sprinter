import { BacklogApiRequest } from "@/content/backlog/BacklogApiRequest"
import { Immutable } from "immer"

export type WikiTag = Immutable<{
  id: number
  name: string
}>

export type Wiki = Immutable<{
  id: number
  projectId: number
  name: string
  content: string
  created: string
  updated: string
  tags: WikiTag[]
}>

const search = async (projectId: number, keyword: string): Promise<ReadonlyArray<Wiki>> => {
  return await BacklogApiRequest.get<Wiki[]>("/api/v2/wikis", {
    projectIdOrKey: "" + projectId,
    keyword
  })
}

const edit = async (wiki: Wiki, name: string, content: string): Promise<Wiki> => {
  const nameForParam = wiki.tags.map((tag) => `[${tag.name}]`).join(" ") + name
  return await BacklogApiRequest.patch<Wiki>(`/api/v2/wikis/${wiki.id}`, {
    name: nameForParam,
    content,
    mailNotify: "false"
  })
}

const add = async (projectId: number, name: string, content: string): Promise<Wiki> => {
  return await BacklogApiRequest.post<Wiki>("/api/v2/wikis", {
    projectId: `${projectId}`,
    name,
    content,
    mailNotify: "false"
  })
}

export const RealWikiApi = {
  search,
  add,
  edit
} as const

export type WikiApi = typeof RealWikiApi
