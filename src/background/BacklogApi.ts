import { ParamsType } from "./BackgroundClient"
import { BacklogApiKeys } from "./backlog-api-keys"
import { BacklogOAuth, BacklogOAuthConfig, TokenInfo } from "./BacklogOAuth"

const accessTokenStorageKey = (hostname: string) => `access-token-${hostname}`

const backlogOAuth2Config = (hostname: string): BacklogOAuthConfig => ({
  ...BacklogApiKeys,
  hostname,
  redirectUri: chrome.identity.getRedirectURL("backlog-api")
})

const getApiKey = (hostname: string): string | null => {
  const m = hostname.match(/^([^.]+)\.backlog\.(jp|com)$/)
  const spaceKey = m ? m[1] : ""
  return BacklogApiKeys.apiKeys[spaceKey] || null
}

const getAccessToken = async (hostname: string, renew?: boolean): Promise<string> => {
  const strKey = accessTokenStorageKey(hostname)
  if (renew) {
    await chrome.storage.local.remove(strKey)
  }
  const stored = (await chrome.storage.local.get(strKey))[strKey] as TokenInfo | undefined
  if (stored?.accessToken) {
    return stored.accessToken
  } else {
    const issued = await BacklogOAuth.issueAccessToken(backlogOAuth2Config(hostname))
    if (issued.accessToken) {
      await chrome.storage.local.set({ [strKey]: issued })
      return issued.accessToken
    }
  }
  throw new Error(`failed to get access token`)
}

const refreshAccessToken = async (hostname: string): Promise<string> => {
  const strKey = accessTokenStorageKey(hostname)
  const stored = (await chrome.storage.local.get(strKey))[strKey] as TokenInfo | undefined
  if (!stored) {
    throw new Error(`storage data ${strKey} not found.`)
  } else {
    const refreshed = await BacklogOAuth.refreshAccessToken(backlogOAuth2Config(hostname), stored.refreshToken)
    if (refreshed.accessToken) {
      await chrome.storage.local.set({ [strKey]: refreshed })
      return refreshed.accessToken
    }
  }
  throw new Error(`failed to refresh access token`)
}

type Success<T> = {
  readonly success: true
  readonly data: T
}

type Error = {
  readonly success: false
  readonly errorData: {
    readonly errors: ReadonlyArray<{
      readonly message: string
      readonly code: number
      readonly moreInfo: string
    }>
  }
}

const send = async <T extends object>(
  url: URL,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: URLSearchParams
): Promise<T> => {
  const sendByApiKey = async (apiKey: string): Promise<Success<T> | Error> => {
    url.searchParams.append("apiKey", apiKey)
    const resp = await fetch(url.href, {
      method,
      body
    })
    if (resp.status === 200) {
      return {
        success: true,
        data: (await resp.json()) as T
      }
    } else {
      return {
        success: false,
        errorData: await resp.json()
      }
    }
  }

  const sendInner = async (accessToken: string, retryCounter: number): Promise<Success<T> | Error> => {
    const resp = await fetch(url.href, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body
    })
    if (resp.status === 200) {
      return {
        success: true,
        data: (await resp.json()) as T
      }
    } else if (resp.status === 401) {
      const message = resp.headers.get("WWW-Authenticate") || "unknown error"
      if (message.match(/token expired/) && retryCounter > 0) {
        return sendInner(await refreshAccessToken(url.hostname), retryCounter - 1)
      } else {
        return sendInner(await getAccessToken(url.hostname, true), retryCounter - 1)
      }
    }
    return {
      success: false,
      errorData: await resp.json()
    }
  }
  const apiKey = getApiKey(url.hostname)
  const result = apiKey ? await sendByApiKey(apiKey) : await sendInner(await getAccessToken(url.hostname), 2)
  if (result.success) {
    return result.data
  } else {
    console.warn(result.errorData)
    throw new Error(result.errorData.errors.map((e) => `${e.code}: ${e.message}`).join("\n"))
  }
}

const isRecord = (obj: ParamsType): obj is Record<string, string> => typeof obj.indexOf === "undefined"

const appendParams = (usp: URLSearchParams, params: ParamsType) => {
  const records = isRecord(params) ? [params] : params
  records.forEach((rec) => {
    for (const key in rec) {
      usp.append(key, rec[key])
    }
  })
}

const sendUrlOnly = async <T extends object>(
  hostname: string,
  httpMethod: "GET" | "DELETE",
  path: string,
  params?: ParamsType
): Promise<T> => {
  const url = new URL(`https://${hostname}${path}`)
  if (params) {
    appendParams(url.searchParams, params)
  }
  return await send<T>(url, httpMethod)
}

const sendFormData = async <T extends object>(
  hostname: string,
  httpMethod: "POST" | "PATCH",
  path: string,
  params: ParamsType
): Promise<T> => {
  const url = new URL(`https://${hostname}${path}`)
  const body = new URLSearchParams()
  appendParams(body, params)
  return await send<T>(url, httpMethod, body)
}

export const BacklogApi = { sendUrlOnly, sendFormData }
