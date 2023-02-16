import { BacklogApiRequest } from "@/content/backlog/BacklogApiRequest"

export type Wiki = {
  id: number
  projectId: number
  name: string
  content: string
  created: string
  updated: string
}

const searchWiki = async (projectId: number, keyword: string): Promise<ReadonlyArray<Wiki>> => {
  return await BacklogApiRequest.get<Wiki[]>("/api/v2/wikis", {
    projectIdOrKey: "" + projectId,
    keyword
  })
}
