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

export const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { tabs, initialIndex, selectedIndex, onTabClicked } = props
  const [stateIndex, select] = React.useState<number>(initialIndex || 0)
  const index = selectedIndex || stateIndex
  return (
    <div className="bsp-tabpanel">
      <nav className="bsp-tabpanel-tabs">
        {tabs.map((tab, i) => (
          <button
            key={i}
            className={"bsp-tabpanel-tabs-tab" + (i === index ? " selected" : "")}
            onClick={() => (onTabClicked ? onTabClicked(i) : select(i))}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="bsp-tabpanel-body">{tabs[index].component()}</div>
    </div>
  )
}
