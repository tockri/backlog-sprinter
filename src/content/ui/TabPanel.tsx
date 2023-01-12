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

const Panel = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
  height: 100%;
`

const TabBar = styled.nav`
  display: block;
  width: 20em;
  background-color: #f0f0f0;
  margin: 0;
  padding: 0;
`

const Tab = styled.button`
  display: block;
  width: 100%;
  padding: 1em 2em;
  margin-bottom: 1px;
  border: 0 none;
  background-color: transparent;
  &.selected {
    background-color: white;
  }
`

const Body = styled.div`
  width: calc(100% - 20em);
  padding: 20px;
  overflow: hidden;
`

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
