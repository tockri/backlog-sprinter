import React from "react"
import { Loading } from "../../ui/Loading"
import { PBIList } from "./PBIList"
import { useProjectProductBacklogViewModel } from "./ViewModel"

export const ProjectProductBacklog: React.FC = () => {
  const vm = useProjectProductBacklogViewModel()
  return vm.items ? <PBIList items={vm.items} /> : <Loading />
}
