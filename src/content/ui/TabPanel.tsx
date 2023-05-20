import styled from "@emotion/styled"
import React from "react"
import { Loading } from "./Loading"

export type TabPanelTabInfo = {
  label: string
  component: () => React.ReactNode
}

export type TabPanelProps = {
  readonly tabs: ReadonlyArray<TabPanelTabInfo>
  readonly initialIndex?: number
  readonly selectedIndex?: number
  readonly onTabClicked?: (tab: number) => void
}

export const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { tabs, initialIndex, selectedIndex, onTabClicked } = props
  const [stateIndex, select] = React.useState<number>(initialIndex || 0)
  const index = selectedIndex || stateIndex
  return (
    <Panel>
      <TabBar>
        {tabs.map((tab, i) => (
          <Tab
            key={i}
            className={i === index ? " selected" : ""}
            onClick={() => (onTabClicked ? onTabClicked(i) : select(i))}
          >
            {tab.label}
          </Tab>
        ))}
      </TabBar>
      <Body>
        <React.Suspense fallback={<Loading />}>{tabs[index].component()}</React.Suspense>
      </Body>
    </Panel>
  )
}

const Panel = styled.div({
  display: "flex",
  width: "100%",
  height: "100%",
  " *": {
    boxSizing: "border-box"
  }
})

const TabBar = styled.nav({
  display: "flex",
  flexDirection: "column",
  width: 100,
  backgroundColor: "#f0f0f0",
  margin: 0,
  padding: 0
})

const Tab = styled.button({
  boxSizing: "border-box",
  padding: "1em 2em",
  whiteSpace: "pre",
  marginBottom: 1,
  border: "0 none",
  backgroundColor: "transparent",
  "&.selected": {
    backgroundColor: "white"
  }
})

const Body = styled.div({
  boxSizing: "border-box",
  width: "calc(100% - 100px)",
  position: "relative"
})
