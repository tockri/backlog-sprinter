import React from "react"
import { useProjectProductBacklogViewModel } from "./ViewModel"

export const ProjectProductBacklog: React.FC = () => {
  const vm = useProjectProductBacklogViewModel()
  const backlogItems = vm.backlogItems
  console.log("backlogItems", backlogItems)
  React.useEffect(() => {
    if (!backlogItems) {
      vm.load()
    }
  }, [vm, backlogItems])
  if (backlogItems) {
    return (
      <div>
        {backlogItems.map((bi) => (
          <div key={bi.id}>
            {bi.issueKey} : {bi.summary}
          </div>
        ))}
      </div>
    )
  } else {
    return <>loading...</>
  }
}
