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

export const BlgApiGet = (path: string, params?: ParamsType): BlgApiGetType => {
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
export const BlgApiPost = (path: string, params: ParamsType): BlgApiPostType => {
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
export const BlgApiPatch = (path: string, params: ParamsType): BlgApiPatchType => {
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

export const BlgApiDelete = (path: string): BlgApiDeleteType => {
  return {
    method: BlgApiMethod.Delete,
    path
  }
}

export type BackgroundMessage = BlgApiGetType | BlgApiPostType | BlgApiPatchType | BlgApiDeleteType

const sendMessage = <T>(message: BackgroundMessage): Promise<T> =>
  new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      const error = chrome.runtime.lastError
      if (error) {
        reject(error)
      } else {
        resolve(response as T)
      }
    })
  })

const blgApiGet = <T>(path: string, params?: ParamsType): Promise<T> => sendMessage<T>(BlgApiGet(path, params))

const blgApiPost = <T>(path: string, params: ParamsType): Promise<T> => sendMessage<T>(BlgApiPost(path, params))

const blgApiPatch = <T>(path: string, params: ParamsType): Promise<T> => sendMessage<T>(BlgApiPatch(path, params))

const blgApiDelete = <T>(path: string): Promise<T> => sendMessage<T>(BlgApiDelete(path))

export const BackgroundClient = {
  blgApiGet,
  blgApiPost,
  blgApiPatch,
  blgApiDelete
} as const
