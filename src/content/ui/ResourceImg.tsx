import React from "react"

export const ResourceImg: React.FC<{
  path: string
  style?: React.CSSProperties
}> = ({ path, style }) => {
  const srcUrl = chrome.runtime.getURL(path)
  return <img src={srcUrl} style={style} alt="" />
}
