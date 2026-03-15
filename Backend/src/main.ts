import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';  // for swagger restful api documentation
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());  // ab pure application me koi bhi error aaye → ye filter handle karega
  app.useGlobalInterceptors(new TransformInterceptor());  // Ab har successful API response automatically transform ho jayega.

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

