type Func<T> = (t: T) => void

export class MessageBroker<T> {
  private readonly subscriber: Record<string, Func<T>> = {}

  dispatch(t: T) {
    for (const key in this.subscriber) {
      this.subscriber[key]?.apply(null, [t])
    }
  }

  subscribe(key: string, callback: Func<T>) {
    this.subscriber[key] = callback
  }

  unsubscribe(key: string) {
    if (key in this.subscriber) {
      delete this.subscriber[key]
    }
  }
}
