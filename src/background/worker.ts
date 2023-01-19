import { BacklogOAuth } from "./BacklogOAuth"
import { BackgroundMessage, BackgroundMessageUtil } from "./types"
import MessageSender = chrome.runtime.MessageSender

chrome.runtime.onMessage.addListener((message: BackgroundMessage, sender: MessageSender, callback) => {
  if (BackgroundMessageUtil.isGetBlgAccessToken(message)) {
    BacklogOAuth.runGetAccessTokenFlow(message.hostname, message.renew).then((accessToken) => {
      callback(accessToken)
    })
  } else if (BackgroundMessageUtil.isRefreshBlgAccessToken(message)) {
    BacklogOAuth.runRenewAccessTokenFlow(message.hostname).then((accessToken) => {
      callback(accessToken)
    })
  } else if (BackgroundMessageUtil.isClearStorage(message)) {
    console.warn("not impl.")
  }
  return true
})
