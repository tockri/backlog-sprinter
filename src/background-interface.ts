export type ParamsType = ReadonlyArray<Record<string, string>> | Record<string, string>

export enum BlgApiMethod {
  Get = "BlgApiGet",
  Post = "BlgApiPost",
  Patch = "BlgApiPatch",
  Delete = "BlgApiDelete"
}

export type BlgApiGetType = {
  readonly method: BlgApiMethod.Get
  readonly path: string
  readonly params?: ParamsType
}

export function BlgApiGet(path: string, params?: ParamsType): BlgApiGetType {
  return {
    method: BlgApiMethod.Get,
    path,
    params
  }
}

export type BlgApiPostType = {
  readonly method: BlgApiMethod.Post
  readonly path: string
  readonly params: ParamsType
}
export function BlgApiPost(path: string, params: ParamsType): BlgApiPostType {
  return {
    method: BlgApiMethod.Post,
    path,
    params
  }
}

export type BlgApiPatchType = {
  readonly method: BlgApiMethod.Patch
  readonly path: string
  readonly params: ParamsType
}
export function BlgApiPatch(path: string, params: ParamsType): BlgApiPatchType {
  return {
    method: BlgApiMethod.Patch,
    path,
    params
  }
}

export type BlgApiDeleteType = {
  readonly method: BlgApiMethod.Delete
  readonly path: string
}

export function BlgApiDelete(path: string): BlgApiDeleteType {
  return {
    method: BlgApiMethod.Delete,
    path
  }
}

export type BackgroundMessage = BlgApiGetType | BlgApiPostType | BlgApiPatchType | BlgApiDeleteType
