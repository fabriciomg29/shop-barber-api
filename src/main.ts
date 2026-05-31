import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  const config = new DocumentBuilder()
    .setTitle('Shop Barber API')
    .setDescription('API para gestão de barbearias')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config))

  await app.listen(process.env.PORT ?? 4870)
}

bootstrap()
