import { collectToken } from "../../backlog-sprinter-secret/negotiate/collectToken"
import { BackgroundClient } from "../background/BackgroundClient"

const main = async () => {
  if (location.pathname === "/api/negotiate") {
    const { accessToken, refreshToken, host } = collectToken()
    if (accessToken && refreshToken && host) {
      await BackgroundClient.storeAccessToken(host, accessToken, refreshToken)
    }
    window.close()
  }
}

main().then()
