import { BadUserInputException } from '@/common/exceptions/bad-user-input.exception';
import metadata from '@/metadata';
import { PrismaClientExceptionFilter } from '@/prisma/prisma-client-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import MongoDBStore from 'connect-mongodb-session';
import session from 'express-session';
import { AppModule } from './app.module';

async function bootstrap() {
  /* -------------------------------------------------------------------------- */
  /*                                    nest                                    */
  /* -------------------------------------------------------------------------- */
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: ['http://localhost:3000'], credentials: true });

  const configService = app.get(ConfigService);
  const port = configService.get<number | undefined>('PORT') ?? 3000;

  const { httpAdapter } = app.get(HttpAdapterHost);

  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (validationErrors) => {
        return new BadUserInputException(validationErrors);
      },
    }),
  );

  /* -------------------------------------------------------------------------- */
  /*                                   swagger                                  */
  /* -------------------------------------------------------------------------- */
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Easy Generator')
    .setDescription('Easy Generator')
    .setVersion('1.0')
    .addTag('Default')
    .addTag('Users')
    .addServer('http://localhost:4000', 'Easy Generator')
    .addBearerAuth()
    .build();

  await SwaggerModule.loadPluginMetadata(metadata);
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  /* -------------------------------------------------------------------------- */
  /*                                   express                                  */
  /* -------------------------------------------------------------------------- */
  const MongoStore = MongoDBStore(session);
  app.use(
    session({
      store: new MongoStore({
        uri: configService.get<string>('DATABASE_URL'),
        collection: 'sessions',
      }),
      name: 'sid',
      secret: configService.get<string>('SESSION_SECRET'),
      resave: false,
      cookie: {
        maxAge: 3 * 30 * 24 * 60 * 60 * 1000, // 120d
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      },
      saveUninitialized: false,
    }),
  );

  await app.listen(port);
}

void bootstrap();
