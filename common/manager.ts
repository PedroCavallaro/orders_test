//isso é só pra testes

export class AppManagerDTO {
  successOnAttempt: number
  breakBroker: boolean
  breakWorker: boolean
  breakConsumer: boolean
  duplicateEvents: boolean
}

export class AppManager {
  public successOnAttempt = 0
  public breakBroker = false
  public breakWorker = false
  public breakConsumer = false
  public duplicateEvents = false

  static instance: AppManager

  static getInstance() {
    if (!AppManager.instance) {
      AppManager.instance = new AppManager()

      return AppManager.instance
    }

    return AppManager.instance
  }

  breakConsumerRandom() {
    if (!this.breakConsumer) return false

    return Math.random() < 0.5
  }

  breakWorkerRadom() {
    if (!this.breakWorker) return false

    return Math.random() < 0.5
  }

  breakBrokerRandom() {
    if (!this.breakBroker) return false

    return Math.random() < 0.5
  }
}

export class AppManagerError extends Error {
  constructor() {
    super()
  }
}
