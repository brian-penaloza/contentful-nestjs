import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ExternalApiService } from './external-api.service';
import { ExternalApiController } from './external-api.controller';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [HttpModule, ProductModule],
  providers: [ExternalApiService],
  controllers: [ExternalApiController],
  exports: [ExternalApiService],
})
export class ExternalApiModule {}
