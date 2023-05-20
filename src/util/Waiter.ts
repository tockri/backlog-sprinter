const waitForReady = (count: number, isReady: () => boolean, callback: () => void) => {
  if (isReady()) {
    callback()
  } else if (count > 0) {
    setTimeout(
      () => {
        waitForReady(count - 1, isReady, callback)
      },
      count < 10 ? 500 : 100
    )
  } else {
    console.error("counter reached to 0, give up.")
  }
}

const watchInfinitely = (isReady: () => boolean, callback: () => void) => {
  setInterval(() => {
    if (isReady()) {
      callback()
    }
  }, 500)
}

const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })

export const Waiter = {
  waitForReady,
  watchInfinitely,
  sleep
}
