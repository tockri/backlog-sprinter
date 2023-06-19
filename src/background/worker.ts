import { BacklogOAuth } from "../../backlog-sprinter-secret/authLogic/BacklogOAuth"
import { ApiKeyEntries } from "./ApiKeyEntries"
import { BackgroundMessage } from "./types"
import MessageSender = chrome.runtime.MessageSender

chrome.runtime.onMessage.addListener((message: unknown, sender: MessageSender, callback) => {
  if (BackgroundMessage.isRefreshBlgAccessToken(message)) {
    BacklogOAuth.runRenewAccessTokenFlow(message.hostname).then((accessToken) => {
      callback(accessToken)
    })
  } else if (BackgroundMessage.isGetStoredAccessToken(message)) {
    BacklogOAuth.getStoredToken(message.hostname).then((token) => {
      if (token) {
        callback(token.accessToken)
      } else {
        console.info(`token for ${message.hostname} not stored.`)
        callback(null)
      }
    })
  } else if (BackgroundMessage.isStoreAccessToken(message)) {
    BacklogOAuth.storeToken(message.hostname, message).then(() => {
      callback()
    })
  } else if (BackgroundMessage.isDeleteAccessToken(message)) {
    BacklogOAuth.deleteToken(message.hostname).then(() => {
      callback()
    })
  } else if (BackgroundMessage.isClearStorage(message)) {
    console.warn("not impl.")
  } else if (BackgroundMessage.isGetApiKey(message)) {
    ApiKeyEntries.get().then((entries) => {
      const entry = entries.find((e) => e.site === message.hostname)
      callback(entry ? entry.key : "")
    })
  } else if (BackgroundMessage.isIssueKey(message)) {
    BacklogOAuth.issueKey().then((code) => {
      callback(code)
    })
  }
  return true
})
