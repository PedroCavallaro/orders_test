import { AppManager } from 'common/manager'
import { backoff } from './backoff'
import { sleep } from './sleep'

export abstract class RetryCommand {
  private exit = false
  private timeout = 1000

  private readonly maxRetries: number

  constructor(maxRetries?: number) {
    this.maxRetries = maxRetries ?? 5
  }

  async execute(attempt = 1, timeout = 1000): Promise<any> {
    try {
      if (attempt < AppManager.getInstance().successOnAttempt) {
        throw new Error('Testing retry')
      }

      const output = await this.callback()

      return output
    } catch (e: unknown) {
      if (attempt >= this.maxRetries) return this.onMaxRetries(e)

      if (this.exit) return

      this.onError?.(e)

      const ms = backoff(attempt)
      console.log(`sleeping ${ms}`)

      await sleep(ms)

      return this.execute((attempt += 1), timeout)
    }
  }

  protected async onMaxRetries(e: unknown) {}

  protected onError(e: unknown) {}

  protected async callback() {
    throw new Error('method not implemented')
  }
}
