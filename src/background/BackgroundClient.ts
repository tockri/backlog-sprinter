import {
  DeleteAccessToken,
  GetApiKey,
  GetStoredAccessToken,
  IssueKey,
  RefreshBlgAccessToken,
  StoreAccessToken
} from "./types"

const sendMessage = <T, M>(message: M): Promise<T> =>
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

const refreshBlgAccessToken = (hostname: string): Promise<string> =>
  sendMessage<string, RefreshBlgAccessToken>({
    method: "RefreshBlgAccessToken",
    hostname
  })

const getApiKey = (hostname: string): Promise<string> =>
  sendMessage<string, GetApiKey>({
    method: "GetApiKey",
    hostname
  })

const getStoredAccessToken = (hostname: string): Promise<string | null> =>
  sendMessage<string | null, GetStoredAccessToken>({
    method: "GetStoredAccessToken",
    hostname
  })

const storeAccessToken = (hostname: string, accessToken: string, refreshToken: string): Promise<void> =>
  sendMessage<void, StoreAccessToken>({
    method: "StoreAccessToken",
    hostname,
    accessToken,
    refreshToken
  })

const deleteAccessToken = (hostname: string): Promise<void> =>
  sendMessage<void, DeleteAccessToken>({
    method: "DeleteAccessToken",
    hostname
  })

const issueKey = (): Promise<string> =>
  sendMessage<string, IssueKey>({
    method: "IssueKey"
  })

export const BackgroundClient = {
  refreshBlgAccessToken,
  getApiKey,
  getStoredAccessToken,
  storeAccessToken,
  deleteAccessToken,
  issueKey
} as const
