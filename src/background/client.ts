import { BackgroundMessage, BackgroundMethod, GetBlgAccessToken, RefreshBlgAccessToken } from "./types"

const sendMessage = <T>(message: BackgroundMessage): Promise<T> =>
  new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      const error = chrome.runtime.lastError
      if (error) {
        console.warn(error)
        reject(error)
      } else {
        resolve(response as T)
      }
    })
  })

const getBlgAccessToken = (hostname: string, renew?: boolean): Promise<string> =>
  sendMessage<string>({
    method: BackgroundMethod.GetBlgAccessToken,
    hostname,
    renew
  } as GetBlgAccessToken)

const refreshBlgAccessToken = (hostname: string): Promise<string> =>
  sendMessage<string>({
    method: BackgroundMethod.RefreshBlgAccessToken,
    hostname
  } as RefreshBlgAccessToken)

export const BackgroundClient = {
  getBlgAccessToken,
  refreshBlgAccessToken
}
