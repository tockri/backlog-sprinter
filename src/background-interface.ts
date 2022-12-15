export type ParamsType = ReadonlyArray<Record<string, string>> | Record<string, string>

export type ApiGet = {
  readonly method: "apiGet"
  readonly path: string
  readonly params?: ParamsType
}

export type ApiPost = {
  readonly method: "apiPost"
  readonly path: string
  readonly params: ParamsType
}

export type ApiPatch = {
  readonly method: "apiPatch"
  readonly path: string
  readonly params: ParamsType
}

export type ApiDelete = {
  readonly method: "apiDelete"
  readonly path: string
}

export type BackgroundMessage = ApiGet | ApiPost | ApiPatch | ApiDelete
