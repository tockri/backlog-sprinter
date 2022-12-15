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
    console.error("couner reached to 0, give up.")
  }
}

const watchInfinitly = (isReady: () => boolean, callback: () => void) => {
  setInterval(() => {
    if (isReady()) {
      callback()
    }
  }, 500)
}

export const Waiter = {
  waitForReady,
  watchInfinitly
}
