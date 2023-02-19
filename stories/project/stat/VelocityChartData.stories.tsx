import { VelocityChartData } from "@/content/project/stat/Model"
import { VelocityChart } from "@/content/project/stat/View"
import { ComponentMeta, ComponentStoryObj } from "@storybook/react"
import React from "react"
import { ProjectStoryTemplate, ProjectStoryTemplateProps } from "../ProjectStoryTemplate"

const data: VelocityChartData = [
  {
    name: "01-01",
    PBI: 1,
    Others: 2
  },
  {
    name: "01-08",
    PBI: 2,
    Others: 20
  },
  {
    name: "01-15",
    PBI: 4,
    Others: 12
  },
  {
    name: "01-22",
    PBI: 2,
    Others: 18
  },
  {
    name: "01-29",
    PBI: 3,
    Others: 10
  }
]
const Template: React.FC<ProjectStoryTemplateProps> = (props) => (
  <ProjectStoryTemplate {...props}>
    <VelocityChart data={data} />
  </ProjectStoryTemplate>
)

export default { component: Template } as ComponentMeta<typeof Template>

type Story = ComponentStoryObj<typeof Template>

export const Default: Story = {
  args: {}
}
