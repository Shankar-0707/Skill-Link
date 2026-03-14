import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';  // for swagger restful api documentation

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Skill-Link API Docs')
    .setDescription('API Documentation for Skill-Link')
    .setVersion('1.0')
    .addBearerAuth() // this is for jwt auth
    .build()

  const document = () => SwaggerModule.createDocument(app, config);  // this method is used specifically to generate the swagger document when we request it 

  SwaggerModule.setup('api', app, document,{
    jsonDocumentUrl: 'api/json',
  });
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
