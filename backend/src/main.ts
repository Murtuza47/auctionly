import 'dotenv/config'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const origins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
  app.enableCors({ origin: origins, credentials: true })
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: false }))
  const port = Number(process.env.PORT ?? 3000)
  await app.listen(port)
}

void bootstrap()
