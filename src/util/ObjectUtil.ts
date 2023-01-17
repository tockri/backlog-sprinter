const purify = <T extends object>(obj: T, template: T): T => {
  const ret: Record<string, unknown> = {}
  Object.keys(template).forEach((key) => {
    ret[key] = obj[key as keyof T]
  })
  return ret as T
}

export const ObjectUtil = {
  purify
}
