import { ApiKeyEntry } from "@/background/types"
import { ObjectUtil } from "@/util/ObjectUtil"

const isApiKeyEntry = (o: unknown): o is ApiKeyEntry =>
  ObjectUtil.matchType<ApiKeyEntry>(o, {
    site: "string",
    key: "string",
    id: "string"
  })

const KEY = "api-key-entries"

const set = async (entries: ReadonlyArray<ApiKeyEntry>) => {
  const mp = new Map<string, ApiKeyEntry>()
  entries.forEach((e) => mp.set(e.site, e))
  const data = JSON.stringify(Array.from(mp.values()))
  console.log("set storage", data)
  await chrome.storage.local.set({ [KEY]: data })
}

const get = async (): Promise<ReadonlyArray<ApiKeyEntry>> => {
  try {
    const all = await chrome.storage.local.get(KEY)
    if (all && all[KEY]) {
      const value = JSON.parse(all[KEY])
      if (Array.isArray(value) && value.every(isApiKeyEntry)) {
        return (value as ReadonlyArray<ApiKeyEntry>).filter((e) => !!e.key || !!e.site)
      } else {
        console.warn(`type not match: ApiKeyEntry: ${JSON.stringify(all, null, 2)}, ${JSON.stringify(value)}`)
      }
    }
  } catch (e) {
    console.warn("error in ApiKeyEntries.get", { e })
  }
  return []
}

export const ApiKeyEntries = {
  get,
  set
}
