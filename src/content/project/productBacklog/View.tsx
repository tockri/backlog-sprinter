import React from "react"
import { Loading } from "../../ui/Loading"
import { PBIList } from "./PBIList"
import { useProjectProductBacklogViewModel } from "./ViewModel"

export const ProjectProductBacklog: React.FC = () => {
  const vm = useProjectProductBacklogViewModel()
  const backlogTable = vm.backlogTable()
  React.useEffect(() => {
    if (!vm.loaded) {
      vm.load()
    }
  }, [vm])
  return vm.loaded ? <PBIList table={backlogTable} /> : <Loading />
}
