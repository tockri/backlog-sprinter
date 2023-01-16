import { Story } from "@storybook/react"
import React from "react"
import { Version } from "../content/backlog/ProjectInfo"
import { IssueDataWithOrder, PBIList } from "../content/project/productBacklog/PBIList"
import { DndTestView } from "../content/project/velocity"
import { Modal } from "../content/ui/Modal"
import { TabPanel } from "../content/ui/TabPanel"

const fakeVersion = (id: number): Version => ({
  id,
  name: `MS ${id}`,
  description: "",
  startDate: `2023-01-${id} 00:00:00Z`,
  releaseDueDate: `2023-01-${id + 10} 00:00:00Z`,
  archived: false,
  displayOrder: id
})
const versions: ReadonlyArray<Version> = [1, 2, 3].map(fakeVersion)
const fakeIssue = (id: number, versionId: number): IssueDataWithOrder => ({
  id,
  issueKey: `FAKE-${id}`,
  summary: `Issue ${id}`,
  status: { id: 1, name: "Open", color: "#ff0000" },
  milestone: versionId ? [versions[versionId - 1]] : [],
  customFields: [],
  order: null
})

const productBacklog: ReadonlyArray<IssueDataWithOrder> = [
  [1, 1],
  [2, 1],
  [3, 1],
  [4, 1],
  [5, 1],
  [6, 1],
  [7, 2],
  [8, 2],
  [9, 2],
  [10, 0],
  [11, 0]
].map(([id, vIdx]) => fakeIssue(id, vIdx))

const TestView: React.FC = () => {
  return <PBIList items={productBacklog} />
}

export const Dnd: Story = () => {
  return (
    <Modal size="large" title="test" onClose={() => {}}>
      <TabPanel
        tabs={[
          {
            label: "PBIList",
            component: () => <TestView />
          },
          {
            label: "test",
            component: () => <div>test tab</div>
          }
        ]}
      />
    </Modal>
  )
}

export const Test: Story = () => {
  return <DndTestView />
}

export default {
  title: "Dnd"
}
