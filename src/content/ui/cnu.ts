import { ObjectUtil } from "../../util/ObjectUtil"

/**
 * className utility.  simplified clsx.
 *
 * Example:
 * cnu({foo:true, bar:false}) => "foo"
 * cnu(["foo", "bar"]) => "foo bar"
 *
 * See more examples: ./cnu.test.ts
 *
 * @param args mixed
 * @returns className
 */
export const cnu = (...args: unknown[]): string => {
  const work: string[] = []
  const apply = (arg: unknown): void => {
    if (typeof arg === "string") {
      work.push(arg)
    } else if (Array.isArray(arg)) {
      arg.forEach(apply)
    } else if (ObjectUtil.isRecord(arg)) {
      Object.keys(arg).forEach((key) => {
        if (arg[key]) {
          work.push(key)
        }
      })
    }
  }
  args.forEach(apply)
  return work.join(" ")
}
