import { BspEnvState } from "@/content/state/BspEnvState"
import { useAtom } from "jotai"

export const useBoardModel = () => {
  const [env, setEnv] = useAtom(BspEnvState.atom)
  return {
    clear: () => {
      setEnv((env) => ({ ...env, projectKey: "" }))
    },
    env: env
  }
}
