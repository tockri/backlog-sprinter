import React from "react"
import { Loading } from "../../ui/Loading"
import { PBIList } from "./PBIList"
import { useProjectProductBacklogViewModel } from "./ViewModel"

export const ProjectProductBacklog: React.FC = () => {
  const vm = useProjectProductBacklogViewModel()
  const { items } = vm
  return items ? <PBIList items={items} /> : <Loading />
}
