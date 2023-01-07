import { BackgroundMessage, BlgApiMethod } from "../background-interface"
import { BacklogApi } from "./BacklogApi"

chrome.runtime.onMessage.addListener((message: BackgroundMessage, sender, callback) => {
  if (sender.url) {
    const url = new URL(sender.url)
    const hostname = url.host
    if (message.method === BlgApiMethod.Get) {
      BacklogApi.sendUrlOnly(hostname, "GET", message.path, message.params).then(callback)
    } else if (message.method === BlgApiMethod.Post) {
      BacklogApi.sendFormData(hostname, "POST", message.path, message.params).then(callback)
    } else if (message.method === BlgApiMethod.Patch) {
      BacklogApi.sendFormData(hostname, "PATCH", message.path, message.params).then(callback)
    } else if (message.method === BlgApiMethod.Delete) {
      BacklogApi.sendUrlOnly(hostname, "DELETE", message.path).then(callback)
    }
  }
  return true
})
