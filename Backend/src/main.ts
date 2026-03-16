import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger, MethodNotAllowedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import helmet from 'helmet'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const compression = require('compression')
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';  // for swagger restful api documentation
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT', 3000)
  const nodeEnv = configService.get<string>('NODE_ENV', 'development')
  const isProduction = nodeEnv === 'production'

  // Security headers
  app.use(helmet())

  // Gzip Compression
  app.use(compression())

  // CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:5173'),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })

  // global Prefix
  app.setGlobalPrefix('api/v1')

  // ── Global validation pipe ────────────────────────────────────────────────
  // whitelist: strip unknown properties — never trust client input
  // forbidNonWhitelisted: throw 400 if unknown props are sent
  // transform: auto-convert types (string "1" → number 1 for @Type(() => Number))
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // Global Exception Filters
  app.useGlobalFilters(new HttpExceptionFilter());  // ab pure application me koi bhi error aaye → ye filter handle karega
  
  // Global Response Transform
  app.useGlobalInterceptors(new TransformInterceptor());  // Ab har successful API response automatically transform ho jayega.

  // ── Swagger (disable in production) ──────────────────────────────────────
  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('SkillLink API')
      .setDescription(
        'SkillLink backend API — connects customers with workers and organisations.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Organisations', 'Organisation profile and listing')
      .addTag('Products', 'Product CRUD and image management')
      .addTag('Reservations', 'Reservation lifecycle and escrow')
      .build()
 
    const document = SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true, // keeps JWT between page reloads in dev
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    })
 
    logger.log(`Swagger docs: http://localhost:${port}/api/docs`)
  }


  // graceful ShutDown
  app.enableShutdownHooks()


  await app.listen(port);
  logger.log(`Application running on port ${port} [${nodeEnv}]`)
}
bootstrap();

