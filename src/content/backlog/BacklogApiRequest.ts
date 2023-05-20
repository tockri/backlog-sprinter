import { BackgroundClient } from "@/background/BackgroundClient"
import { Either, EitherT } from "@/util/Either"
import { Immutable } from "immer"

export type ErrorData = Immutable<{
  errors: {
    message: string
    code: number
    moreInfo: string
  }[]
}>

const send = async <T extends object>(
  url: URL,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: URLSearchParams
): Promise<T> => {
  const apiKey = await BackgroundClient.getApiKey(url.hostname)

  const sendByApiKey = async (apiKey: string): Promise<EitherT<ErrorData, T>> => {
    url.searchParams.append("apiKey", apiKey)
    const resp = await fetch(url.href, {
      method,
      body
    })
    if (200 <= resp.status && resp.status < 300) {
      return Either.right((await resp.json()) as T)
    } else {
      return Either.left((await resp.json()) as ErrorData)
    }
  }

  const sendInner = async (accessToken: string, retryCounter: number): Promise<EitherT<ErrorData, T>> => {
    const resp = await fetch(url.href, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body
    })
    if (200 <= resp.status && resp.status < 300) {
      return Either.right((await resp.json()) as T)
    } else if (resp.status === 401) {
      const message = resp.headers.get("WWW-Authenticate") || "unknown error"
      if (message.match(/(token expired)|(invalid_token)/) && retryCounter > 0) {
        return await sendInner(await BackgroundClient.refreshBlgAccessToken(url.hostname), retryCounter - 1)
      } else {
        console.log("401 failure", { message, accessToken })
        await BackgroundClient.deleteAccessToken(url.hostname)
      }
    }
    return Either.left((await resp.json()) as ErrorData)
  }
  const result = apiKey
    ? await sendByApiKey(apiKey)
    : await (async () => {
        const accessToken = await BackgroundClient.getStoredAccessToken(url.hostname)
        if (accessToken) {
          return sendInner(accessToken, 2)
        } else {
          throw new Error("accessToken is not set")
        }
      })()

  if (Either.isLeft(result)) {
    console.warn("api error", result.left)
    throw result.left
  } else {
    return result.right
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

export const BacklogApiRequest = {
  get: sendUrlOnly("GET"),
  delete: sendUrlOnly("DELETE"),
  post: sendFormData("POST"),
  patch: sendFormData("PATCH")
} as const
