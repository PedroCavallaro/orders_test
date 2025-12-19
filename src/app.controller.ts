import { Body, Controller, Get, Post } from '@nestjs/common'
import { AppManager, AppManagerDTO } from 'common/manager'

@Controller()
export class AppController {
  constructor() {}

  @Get()
  healthCheck() {
    return { date: new Date() }
  }

  @Post()
  breakApp(@Body() dto: AppManagerDTO) {
    AppManager.getInstance().successOnAttempt = dto?.successOnAttempt ?? 0
    AppManager.getInstance().breakBroker = dto?.breakBroker ?? false
    AppManager.getInstance().breakWorker = dto?.breakWorker ?? false
    AppManager.getInstance().breakConsumer = dto?.breakConsumer ?? false
    AppManager.getInstance().duplicateEvents = dto?.duplicateEvents ?? false

    return AppManager.getInstance()
  }
}
