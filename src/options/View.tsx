// noinspection JSXDomNesting

import { ApiKeyEntry } from "@/background/types"
import { i18n } from "@/options/i18n"
import { ApiKeyEntriesState } from "@/options/state/ApiKeyEntriesState"
import { LangState } from "@/options/state/LangState"
import { TabUtil } from "@/options/TabUtil"
import { Loadable } from "@/util/Loadable"
import styled from "@emotion/styled"
import { useAtom, useAtomValue } from "jotai"
import React from "react"

export const OptionsView: React.FC = () => {
  const [entries, dispatch] = useAtom(ApiKeyEntriesState.atom)
  const lang = useAtomValue(LangState.atom)
  const t = i18n(lang)
  const keyInput = React.useRef<HTMLInputElement | null>(null)
  const [appendCounter, setCounter] = React.useState(0)
  const currentSite = React.useMemo(() => TabUtil.loadableCurrentSite(), [])
  React.useEffect(() => {
    if (keyInput.current && appendCounter > 0) {
      keyInput.current.focus()
    }
  }, [appendCounter])
  return (
    <div style={{ width: 500, margin: 8 }}>
      <h2>{t.apiKey}</h2>
      <table style={{ borderSpacing: 0 }}>
        <colgroup>
          <col style={{ width: "40%" }} />
          <col style={{ width: "58%" }} />
          <col style={{ width: "2%" }} />
        </colgroup>
        <thead>
          <tr>
            <Th>{t.site}</Th>
            <Th>{t.key}</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <Td>
                <Input
                  ref={keyInput}
                  type="text"
                  style={{ width: "100%" }}
                  value={entry.site}
                  onChange={async (e) => {
                    await dispatch(ApiKeyEntriesState.Action.Modify(entry.id, { site: e.target.value }))
                  }}
                  onBlur={() => {
                    dispatch(ApiKeyEntriesState.Action.Save()).then()
                  }}
                  placeholder="your_space.backlog.com"
                />
              </Td>
              <Td>
                <Input
                  type="text"
                  style={{ width: "100%" }}
                  value={entry.key}
                  onChange={async (e) => {
                    await dispatch(ApiKeyEntriesState.Action.Modify(entry.id, { key: e.target.value }))
                  }}
                  onBlur={() => {
                    dispatch(ApiKeyEntriesState.Action.Save()).then()
                  }}
                  placeholder={t.inputKey}
                />
                <br />
                <React.Suspense fallback="">
                  <KeyHelpView entry={entry} currentSite={currentSite} />
                </React.Suspense>
              </Td>
              <Td>
                <button
                  type="button"
                  onClick={() => {
                    dispatch(ApiKeyEntriesState.Action.Delete(entry.id)).then()
                  }}
                >
                  -
                </button>
              </Td>
            </tr>
          ))}
          <tr>
            <Td colSpan={2}>
              <button
                type="button"
                disabled={appendDisabled(entries)}
                onClick={() => {
                  dispatch(ApiKeyEntriesState.Action.Append()).then(() => {
                    setCounter(appendCounter + 1)
                  })
                }}
              >
                +
              </button>
            </Td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

const appendDisabled = (list: ReadonlyArray<ApiKeyEntry>): boolean => !!list.find((e) => e.site === "" || e.key === "")

const Input = styled.input({
  boxSizing: "border-box",
  border: "0 none",
  outline: "none",
  padding: 8,
  "&:focus": {
    outline: "1px solid #c0c0c0",
    borderRadius: 2
  }
})

const Th = styled.th({
  backgroundColor: "#f0f0f0",
  textAlign: "left",
  padding: "8px 12px"
})

const Td = styled.td({
  padding: 4
})

const KeyHelpView: React.FC<{ entry: ApiKeyEntry; currentSite: Loadable<string> }> = ({ entry, currentSite }) => {
  const site = currentSite.getOrThrow()
  if (entry.site === site && entry.key === "") {
    return (
      <a
        href={`https://${site}/EditApiSettings.action`}
        onClick={async (e) => {
          try {
            chrome.tabs.create({
              url: (e.target as HTMLAnchorElement).href
            })
          } catch (e) {
            console.warn(e)
          }
        }}
      >
        go to api key page
      </a>
    )
  } else {
    return <></>
  }
}
