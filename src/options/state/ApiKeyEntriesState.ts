import { ApiKeyEntries } from "@/background/ApiKeyEntries"
import { ApiKeyEntry } from "@/background/types"
import { JotaiUtil } from "@/content/util/JotaiUtil"
import { TabUtil } from "@/options/TabUtil"
import { produce } from "immer"

type ListType = ReadonlyArray<ApiKeyEntry>

type Append = {
  type: "Append"
}

type ApiKeyEntryInput = Omit<Partial<ApiKeyEntry>, "id">

type Modify = {
  type: "Modify"
  id: string
  input: ApiKeyEntryInput
}

type Delete = {
  type: "Delete"
  id: string
}

type Save = {
  type: "Save"
}

type Replace = {
  type: "Replace"
  data: ListType
}

type Action = Append | Modify | Delete | Save | Replace

const listAtom = JotaiUtil.asyncAtomWithAction(
  () => ApiKeyEntries.get(),
  () => async (curr, _get, _set, action: Action) => {
    if (action.type === "Append") {
      const updated = await append(curr)
      ApiKeyEntries.set(updated).then()
      return updated
    } else if (action.type === "Modify") {
      return modify(curr, action)
    } else if (action.type === "Delete") {
      const updated = deleteEntry(curr, action)
      ApiKeyEntries.set(updated).then()
      return updated
    } else if (action.type === "Save") {
      ApiKeyEntries.set(curr).then()
    } else if (action.type === "Replace") {
      return action.data
    }
    return curr
  }
)

const append = async (curr: ListType): Promise<ListType> => {
  const site = await TabUtil.currentSite()
  return produce(curr, (d) => {
    d.push({
      id: genId(curr),
      site,
      key: ""
    })
  })
}

const genId = (curr: ListType): string => {
  for (let i = 0; i < 10; i++) {
    const newId = `${Date.now()}-${Math.floor(Math.random() * 1000.0)}`
    if (!curr.find((e) => e.id === newId)) {
      return newId
    }
  }
  throw new Error("genId failed 10 times")
}

const modify = (curr: ListType, action: Modify): ListType =>
  produce(curr, (d) => {
    const idx = d.findIndex((e) => e.id === action.id)
    if (idx >= 0) {
      d.splice(idx, 1, {
        ...d[idx],
        ...action.input
      })
    }
  })

const deleteEntry = (curr: ListType, action: Delete): ListType =>
  produce(curr, (d) => {
    const idx = d.findIndex((e) => e.id === action.id)
    if (idx >= 0) {
      d.splice(idx, 1)
    }
  })

export const ApiKeyEntriesState = {
  atom: listAtom,
  Action: {
    Append: (): Append => ({
      type: "Append"
    }),
    Modify: (id: string, input: ApiKeyEntryInput): Modify => ({
      type: "Modify",
      id,
      input
    }),
    Delete: (id: string): Delete => ({
      type: "Delete",
      id
    }),
    Save: (): Save => ({
      type: "Save"
    })
  },
  TestAction: {
    Replace: (data: ListType): Replace => ({
      type: "Replace",
      data
    })
  }
}
