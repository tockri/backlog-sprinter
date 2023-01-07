import {
  BackgroundMessage,
  BlgApiDelete,
  BlgApiGet,
  BlgApiPatch,
  BlgApiPost,
  ParamsType
} from "../background-interface"

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
