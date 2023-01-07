import React from "react"

export type TabPanelTabInfo = {
  label: string
  component: () => React.ReactNode
}

export type TabPanelProps = {
  readonly tabs: ReadonlyArray<TabPanelTabInfo>
  readonly initialIndex?: number
}

export const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { tabs, initialIndex } = props
  const [selectedIndex, select] = React.useState<number>(initialIndex || 0)
  return (
    <div className="bsp-tabpanel">
      <nav className="bsp-tabpanel-tabs">
        {tabs.map((tab, i) => (
          <button
            key={i}
            className={"bsp-tabpanel-tabs-tab" + (i === selectedIndex ? " selected" : "")}
            onClick={() => select(i)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="bsp-tabpanel-body">{tabs[selectedIndex].component()}</div>
    </div>
  )
}
