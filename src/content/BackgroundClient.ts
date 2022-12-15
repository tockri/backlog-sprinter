import { ApiDelete, ApiGet, ApiPatch, ApiPost, BackgroundMessage, ParamsType } from "../background-interface"

const send = <T>(message: BackgroundMessage): Promise<T> =>
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

const apiGet = async <T>(path: string, params?: ParamsType): Promise<T> => {
  const message: ApiGet = {
    method: "apiGet",
    path,
    params
  }
  return await send<T>(message)
}

const apiPost = async <T>(path: string, params: ParamsType): Promise<T> => {
  const message: ApiPost = {
    method: "apiPost",
    path,
    params
  }
  return await send<T>(message)
}

const apiPatch = async <T>(path: string, params: ParamsType): Promise<T> => {
  const message: ApiPatch = {
    method: "apiPatch",
    path,
    params
  }
  return await send<T>(message)
}

const apiDelete = async <T>(path: string): Promise<T> => {
  const message: ApiDelete = {
    method: "apiDelete",
    path
  }
  return await send<T>(message)
}

export const BackgroundClient = {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete
} as const
