import { ComponentStoryObj } from "@storybook/react"
import produce from "immer"
import { WritableDraft } from "immer/dist/types/types-external"
import { JSXElementConstructor } from "react"

type StoryParam = keyof JSX.IntrinsicElements | JSXElementConstructor<any>

const produceStory =
  <T extends StoryParam>(story: ComponentStoryObj<T>) =>
  (recipe: (args: NonNullable<WritableDraft<typeof story.args>>) => void): ComponentStoryObj<T> =>
    produce(story, (draft) => {
      const args = draft.args as WritableDraft<ComponentStoryObj<T>["args"]>
      if (args) {
        recipe(args)
      }
    })

export const StoryUtil = {
  produce: produceStory
}
