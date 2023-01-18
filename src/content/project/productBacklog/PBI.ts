import { IssueData } from "../../backlog/Issue"
import { Version } from "../../backlog/ProjectInfo"
import { NestedList, NestedListData, NestMethods } from "./NestedList"

export type IssueDataWithOrder = IssueData & { readonly order: number | null }
export type PBIListData = NestedListData<Version, IssueDataWithOrder>

const headSortKey = (head: Version | null) =>
  head && head.releaseDueDate ? Date.parse(head.releaseDueDate) : Number.MAX_VALUE

export const pbiNestMethods: NestMethods<Version, IssueDataWithOrder> = {
  itemToHead: (item) => item.milestone.find((m) => m.startDate && m.releaseDueDate) || null,
  itemComparator: (item1, item2) => NestedList.compareNullable(item1.order, item2.order),
  headId: (head) => (head ? "" + head.id : "--"),
  headComparator: (head1, head2) => NestedList.compareNullable(headSortKey(head1), headSortKey(head2))
}

export const nestBacklogItems = (items: ReadonlyArray<IssueDataWithOrder>): PBIListData => {
  return NestedList.nest<Version, IssueDataWithOrder>(items, pbiNestMethods)
}
