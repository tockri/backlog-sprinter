import { atom } from "jotai"

export type Lang = "en" | "ja"

const mainAtom = atom<Promise<Lang>>(async () => {
  try {
    const langs = await chrome.i18n.getAcceptLanguages()
    for (const l of langs) {
      if (l.match(/^ja/)) {
        return "ja"
      } else if (l.match(/^en/)) {
        return "en"
      }
    }
  } catch (e) {
    console.warn(e)
  }
  return "en"
})

export const LangState = {
  atom: mainAtom
}
