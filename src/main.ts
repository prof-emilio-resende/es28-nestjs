import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as hbs from 'express-handlebars';
import { renderImcTable } from './hbs/helpers';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.engine(
    'hbs',
    hbs.engine({
      extname: 'hbs',
      helpers: { imcTable: renderImcTable },
    }),
  );
  app.setViewEngine('hbs');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  await app.listen(3000);
}

bootstrap();
