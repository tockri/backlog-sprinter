import styled from "@emotion/styled"
import React from "react"

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

const Panel = styled.div({
  display: "flex",
  width: "100%",
  height: "100%"
})

const TabBar = styled.nav({
  display: "flex",
  flexDirection: "column",
  width: "20em",
  backgroundColor: "#f0f0f0",
  margin: 0,
  padding: 0
})

const Tab = styled.button({
  padding: "1em 2em",
  marginBottom: 1,
  border: "0 none",
  backgroundColor: "transparent",
  "&.selected": {
    backgroundColor: "white"
  }
})

const Body = styled.div({
  flexGrow: 1,
  padding: 24,
  overflow: "auto"
})

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
      <Body>{tabs[index].component()}</Body>
    </Panel>
  )
}
