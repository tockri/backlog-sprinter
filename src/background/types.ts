import { ObjectUtil } from "../util/ObjectUtil"

export enum BackgroundMethod {
  GetBlgAccessToken = "GetBlgAccessToken",
  RefreshBlgAccessToken = "RefreshBlgAccessToken",
  ClearStorage = "ClearStorage"
}

export type GetBlgAccessToken = {
  readonly method: BackgroundMethod.GetBlgAccessToken
  readonly hostname: string
  readonly renew?: boolean
}

const isGetBlgAccessToken = (o: unknown): o is GetBlgAccessToken =>
  ObjectUtil.isRecord(o) && o["method"] === BackgroundMethod.GetBlgAccessToken && typeof o["hostname"] === "string"

export type RefreshBlgAccessToken = {
  readonly method: BackgroundMethod.RefreshBlgAccessToken
  readonly hostname: string
}

const isRefreshBlgAccessToken = (o: unknown): o is RefreshBlgAccessToken =>
  ObjectUtil.isRecord(o) && o["method"] === BackgroundMethod.RefreshBlgAccessToken && typeof o["hostname"] === "string"

export type ClearStorage = {
  readonly method: BackgroundMethod.ClearStorage
}

const isClearStorage = (o: unknown): o is ClearStorage =>
  ObjectUtil.isRecord(o) && o["method"] === BackgroundMethod.ClearStorage

export type BackgroundMessage = GetBlgAccessToken | RefreshBlgAccessToken | ClearStorage

export const BackgroundMessageUtil = {
  isGetBlgAccessToken,
  isRefreshBlgAccessToken,
  isClearStorage
}
