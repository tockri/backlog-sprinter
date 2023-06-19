import { Story } from "@ladle/react"
import { VBox } from "./Box"
import React from 'react'

export default {
  name: "ui/Box"
}

export const Default: Story = () => {
  return (<VBox>
    <div>縦に</div>
    <div>並ぶ</div>
  </VBox>)
}
