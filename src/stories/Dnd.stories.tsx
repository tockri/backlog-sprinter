import { Story } from "@storybook/react"
import React from "react"
import { VelocityView } from "../content/project/velocity"
import { Modal } from "../content/ui/Modal"
import { TabPanel } from "../content/ui/TabPanel"

export const Dnd: Story = () => {
  return (
    <Modal size="large" title="test" onClose={() => {}}>
      <TabPanel
        tabs={[
          {
            label: "VelocityView",
            component: () => <VelocityView />
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

export default {
  title: "Dnd"
}
