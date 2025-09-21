import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { ExternalApiModule } from './external-api/external-api.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Product } from './product/entities/product.entity';
import { User } from './auth/entities/user.entity';
import { SeedInitService } from './seed/seed-init.service';

// Configuración condicional de TypeORM
const getTypeOrmConfig = () => {
  // Si estamos en modo build (AUTO_SEED=false), no cargar TypeORM
  if (process.env.AUTO_SEED === 'false') {
    return [];
  }
  
  return [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'contentful_db',
      entities: [Product, User],
      synchronize: true,
      retryAttempts: 10,
      retryDelay: 3000,
      connectTimeoutMS: 10000,
    }),
  ];
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ...getTypeOrmConfig(),
    ProductModule,
    AuthModule,
    ExternalApiModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedInitService],
})
export class AppModule {}
