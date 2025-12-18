import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'

export function doRequest(app: INestApplication) {
  return request(app.getHttpServer())
}
