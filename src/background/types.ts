import { ObjectUtil } from "@/util/ObjectUtil"
import { Immutable } from "immer"

const isMessage =
  <T>(method: string) =>
  (o: unknown): o is T =>
    ObjectUtil.isRecord(o) && o["method"] === method

export type RefreshBlgAccessToken = {
  readonly method: "RefreshBlgAccessToken"
  readonly hostname: string
}

const isRefreshBlgAccessToken = isMessage<RefreshBlgAccessToken>("RefreshBlgAccessToken")

export type ClearStorage = {
  readonly method: "ClearStorage"
}

const isClearStorage = isMessage<ClearStorage>("ClearStorage")

export type GetApiKey = {
  readonly method: "GetApiKey"
  readonly hostname: string
}

const isGetApiKey = isMessage<GetApiKey>("GetApiKey")

export type GetStoredAccessToken = {
  readonly method: "GetStoredAccessToken"
  readonly hostname: string
}

const isGetStoredAccessToken = isMessage<GetStoredAccessToken>("GetStoredAccessToken")

export type StoreAccessToken = {
  readonly method: "StoreAccessToken"
  readonly hostname: string
  readonly accessToken: string
  readonly refreshToken: string
}

const isStoreAccessToken = isMessage<StoreAccessToken>("StoreAccessToken")

export type DeleteAccessToken = {
  readonly method: "DeleteAccessToken"
  readonly hostname: string
}

const isDeleteAccessToken = isMessage<DeleteAccessToken>("DeleteAccessToken")

export type IssueKey = {
  readonly method: "IssueKey"
}

const isIssueKey = isMessage<IssueKey>("IssueKey")

export const BackgroundMessage = {
  isRefreshBlgAccessToken,
  isClearStorage,
  isGetApiKey,
  isGetStoredAccessToken,
  isStoreAccessToken,
  isDeleteAccessToken,
  isIssueKey
} as const

export type ApiKeyEntry = Immutable<{
  id: string
  site: string
  key: string
}>
