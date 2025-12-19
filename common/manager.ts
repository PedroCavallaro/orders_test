//isso é só pra testes
export class AppManager {
  public successOnAttempt = 0
  public _breakBroker = true
  public _breakWorker = true
  public duplicateEvents = true

  static instance: AppManager

  static getInstance() {
    if (!AppManager.instance) {
      AppManager.instance = new AppManager()

      return AppManager.instance
    }

    return AppManager.instance
  }

  breakWorker() {
    if (!this._breakWorker) return false

    return Math.random() < 0.5
  }

  breakBroker() {
    if (!this._breakBroker) return false

    return Math.random() < 0.5
  }
}

export class AppManagerError extends Error {
  constructor() {
    super()
  }
}
