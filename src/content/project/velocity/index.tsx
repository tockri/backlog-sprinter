import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import React from "react"

const origData = {
  groups: [
    {
      id: "g1",
      items: [
        { id: "i1", name: "item 1" },
        { id: "i2", name: "item 2" },
        { id: "i3", name: "item 3" }
      ]
    },
    {
      id: "g2",
      items: [
        { id: "i4", name: "item 4" },
        { id: "i5", name: "item 5" }
      ]
    }
  ]
}
const ids = origData.groups.reduce((acc, group) => acc.concat(group.items.map((i) => i.id)), [] as string[])

export const VelocityView: React.FC = () => {
  const [items, setItems] = React.useState(origData)
  const sensors = useSensors(useSensor(PointerSensor))
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(e) => {
        const { active, over } = e
        if (over && active.id !== over.id) {
          console.log("dragEnd", { active, over })
          // setItems((prev) => {
          //   active.data.current
          //   const oldIndex = prev.indexOf(active.id as number)
          //   const newIndex = prev.indexOf(over.id as number)

          //   return arrayMove(prev, oldIndex, newIndex)
          // })
        }
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {items.groups.map((g) => (
          <div key={g.id}>
            <div style={{ backgroundColor: "#c0c0c0", color: "white" }}>[group {g.id}]</div>
            {g.items.map((i) => (
              <SortableItem key={i.id} id={i.id} name={i.name} />
            ))}
          </div>
        ))}
      </SortableContext>
    </DndContext>
  )
}

const SortableItem: React.FC<{ id: string; name: string }> = (props) => {
  const { attributes, listeners, setNodeRef, transition, transform } = useSortable({ id: props.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: "1px solid gray",
    padding: 8
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      sortable: {props.name} ({props.id})
    </div>
  )
}
