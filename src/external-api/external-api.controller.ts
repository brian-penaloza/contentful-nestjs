import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExternalApiService } from './external-api.service';

@ApiTags('external-api')
@Controller('external')
export class ExternalApiController {
  constructor(private readonly externalApiService: ExternalApiService) {}

  @ApiOperation({ summary: 'Obtener productos desde API externa (Contentful)' })
  @ApiResponse({ status: 200, description: 'Productos obtenidos exitosamente' })
  @ApiResponse({ status: 500, description: 'Error al obtener productos' })
  @Get('products')
  async getProductsFromExternal() {
    return this.externalApiService.fetchProducts();
  }
}
