import { Controller, Get, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { QueryProductDto } from './dto/query-product.dto';
import { StatsQueryDto } from './dto/stats-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiResponse({ status: 200, description: 'Lista de productos obtenida exitosamente' })
  @Get()
  findAll(@Query() queryDto: QueryProductDto) {
    return this.productService.findAll(queryDto);
  }

  @ApiOperation({ summary: 'Eliminar producto (soft delete)' })
  @ApiResponse({ status: 200, description: 'Producto eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener porcentaje de productos eliminados' })
  @ApiResponse({ status: 200, description: 'Porcentaje calculado exitosamente' })
  @UseGuards(JwtAuthGuard)
  @Get('deleted-percentage')
  getDeletedPercentage() {
    return this.productService.getDeletedPercentage();
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener porcentaje de productos no eliminados' })
  @ApiResponse({ status: 200, description: 'Porcentaje calculado exitosamente' })
  @UseGuards(JwtAuthGuard)
  @Get('report')
  getNonDeletedPercentage(@Query() queryDto: StatsQueryDto) {
    return this.productService.getNonDeletedPercentage(queryDto);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener productos con stock bajo' })
  @ApiResponse({ status: 200, description: 'Lista de productos con stock bajo' })
  @UseGuards(JwtAuthGuard)
  @Get('low-stock')
  getLowStockProducts(@Query('stock') stock: string) {
    return this.productService.getLowStockProducts(+stock);
  }
}
