export type BacklogOAuthConfig = {
  readonly hostname: string
  readonly clientId: string
  readonly clientSecret: string
  readonly redirectUri: string
}

const requestAccessCode = (config: BacklogOAuthConfig, state: string): Promise<string> => {
  const req = new URL(`https://${config.hostname}/OAuth2AccessRequest.action`)
  const params = req.searchParams
  params.set("response_type", "code")
  params.set("client_id", config.clientId)
  params.set("redirect_uri", config.redirectUri)
  params.set("state", state)
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        url: req.href,
        interactive: true
      },
      (redirectedUrl) => {
        if (redirectedUrl) {
          const params = new URL(redirectedUrl).searchParams
          const code = params.get("code")
          const paramState = params.get("state")
          if (code && paramState === state) {
            resolve(code)
          } else {
            reject(new Error(`invalid redirection: ${redirectedUrl}`))
          }
        } else {
          reject(new Error(`failed to get code`))
        }
      }
    )
  })
}

type TokenResponse = {
  readonly access_token: string
  readonly token_type: "Bearer"
  readonly expires_in: number
  readonly refresh_token: string
}

export type TokenInfo = {
  readonly accessToken: string
  readonly refreshToken: string
}

const requestToken = async (config: BacklogOAuthConfig, code: string): Promise<TokenInfo> => {
  const body = new URLSearchParams()
  body.append("grant_type", "authorization_code")
  body.append("code", code)
  body.append("redirect_uri", config.redirectUri)
  body.append("client_id", config.clientId)
  body.append("client_secret", config.clientSecret)
  const response = await fetch(`https://${config.hostname}/api/v2/oauth2/token`, {
    method: "POST",
    body
  })
  if (response.status === 200) {
    const resBody: TokenResponse = await response.json()
    return {
      accessToken: resBody.access_token,
      refreshToken: resBody.refresh_token
    }
  } else {
    const errorMessage = response.headers.get("WWW-Authenticate")
    throw new Error(`failed to negotiate: ${errorMessage}`)
  }
}

const issueAccessToken = async (config: BacklogOAuthConfig): Promise<TokenInfo> => {
  const code = await requestAccessCode(config, "" + Math.floor(Math.random() * 100000))
  const authInfo = await requestToken(config, code)
  return authInfo
}

const refreshAccessToken = async (config: BacklogOAuthConfig, refreshToken: string): Promise<TokenInfo> => {
  const body = new URLSearchParams()
  body.append("grant_type", "refresh_token")
  body.append("client_id", config.clientId)
  body.append("client_secret", config.clientSecret)
  body.append("refresh_token", refreshToken)
  const response = await fetch(`https://${config.hostname}/api/v2/oauth2/token`, {
    method: "POST",
    body
  })
  if (response.status === 200) {
    const resBody: TokenResponse = await response.json()
    return {
      accessToken: resBody.access_token,
      refreshToken: resBody.refresh_token
    }
  } else {
    const errorMessage = response.headers.get("WWW-Authenticate")
    throw new Error(`failed to refresh: ${errorMessage}`)
  }
}

export const BacklogOAuth = {
  issueAccessToken,
  refreshAccessToken
} as const
