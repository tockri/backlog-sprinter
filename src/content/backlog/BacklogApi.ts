import { BackgroundClient } from "../../background/client"

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
  const apiKey = localStorage.getItem("backlog-api-key")
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
        return sendInner(await BackgroundClient.refreshBlgAccessToken(url.hostname), retryCounter - 1)
      } else {
        return sendInner(await BackgroundClient.getBlgAccessToken(url.hostname, true), retryCounter - 1)
      }
    }
    return {
      success: false,
      errorData: await resp.json()
    }
  }
  const result = apiKey
    ? await sendByApiKey(apiKey)
    : await sendInner(await BackgroundClient.getBlgAccessToken(url.hostname), 2)
  if (result.success) {
    return result.data
  } else {
    console.warn(result.errorData)
    throw new Error(result.errorData.errors.map((e) => `${e.code}: ${e.message}`).join("\n"))
  }
}

export type ParamsType = ReadonlyArray<Record<string, string>> | Record<string, string>

const isRecord = (obj: ParamsType): obj is Record<string, string> => typeof obj.indexOf === "undefined"

const appendParams = (usp: URLSearchParams, params: ParamsType) => {
  const records = isRecord(params) ? [params] : params
  records.forEach((rec) => {
    for (const key in rec) {
      usp.append(key, rec[key])
    }
  })
}

const sendUrlOnly =
  (httpMethod: "GET" | "DELETE") =>
  async <T extends object>(path: string, params?: ParamsType): Promise<T> => {
    const hostname = location.hostname
    const url = new URL(`https://${hostname}${path}`)
    if (params) {
      appendParams(url.searchParams, params)
    }
    return await send<T>(url, httpMethod, undefined)
  }

const sendFormData =
  (httpMethod: "POST" | "PATCH") =>
  async <T extends object>(path: string, params: ParamsType): Promise<T> => {
    const hostname = location.hostname
    const url = new URL(`https://${hostname}${path}`)
    const body = new URLSearchParams()
    appendParams(body, params)
    return await send<T>(url, httpMethod, body)
  }

export const BacklogApi = {
  get: sendUrlOnly("GET"),
  delete: sendUrlOnly("DELETE"),
  post: sendFormData("POST"),
  patch: sendFormData("PATCH")
}
