import { BacklogApiContext } from "@/content/backlog/BacklogApiForReact"
import { BoardEnvState } from "@/content/board/state/BoardEnvState"
import { BoardEnv } from "@/content/board/types"
import { ApiState } from "@/content/state/ApiState"
import { EnvState } from "@/content/state/EnvState"
import { MessageBroker } from "@/util/MessageBroker"
import { createStore } from "jotai"
import React, { useEffect } from "react"

const jotaiStore = createStore()

export const useBoardModel = (broker: MessageBroker<BoardEnv>) => {
  const [env, setEnv] = React.useState<BoardEnv | null>(null)
  const api = React.useContext(BacklogApiContext)
  useEffect(() => {
    jotaiStore.set(ApiState.atom, api)
    if (!env) {
      broker.subscribe("Board", async (env) => {
        setEnv(env)
        jotaiStore.set(EnvState.atom, env)
        jotaiStore.set(BoardEnvState.atom, env)
      })
    }
    return () => {
      broker.unsubscribe("Board")
    }
  }, [broker, setEnv, api, env])
  return {
    clear: () => {
      setEnv(null)
    },
    env: env,
    jotaiStore
  }
}
