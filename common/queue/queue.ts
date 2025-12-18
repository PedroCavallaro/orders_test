export class Queue<T> {
  private _queue: T[] = []

  constructor(queue?: T[]) {
    this.queue = queue ?? []
  }

  add(item: T) {
    this._queue.push(item)
  }

  pop(): T | undefined {
    return this._queue.shift()
  }

  set queue(items: T[]) {
    this._queue = items
  }
}
