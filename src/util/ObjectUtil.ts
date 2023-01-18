const purify = <T extends object>(obj: T, template: T): T => {
  const ret: Record<string, unknown> = {}
  Object.keys(template).forEach((key) => {
    ret[key] = obj[key as keyof T]
  })
  return ret as T
}

const isStrictEqual = (o1: any, o2: any): boolean => {
  if (o1 === o2) {
    return true
  } else if (typeof o1 === typeof o2) {
    if ((o1 && !o2) || (!o1 && o2)) {
      return false
    } else if (typeof o1 === "object") {
      const keys1 = Object.keys(o1).sort()
      const keys2 = Object.keys(o2).sort()
      if (keys1.length === keys2.length) {
        for (let i = 0; i < keys1.length; i++) {
          const key = keys1[i]
          if (!isStrictEqual(o1[key], o2[key])) {
            return false
          }
        }
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  } else {
    return false
  }
}

export const ObjectUtil = {
  purify,
  isStrictEqual
}
