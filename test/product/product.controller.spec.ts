import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../../src/product/product.controller';
import { ProductService } from '../../src/product/product.service';
import { QueryProductDto } from '../../src/product/dto/query-product.dto';
import { StatsQueryDto } from '../../src/product/dto/stats-query.dto';
import { mockProductResponses } from '../mocks/test-data';

describe('ProductController', () => {
  let controller: ProductController;
  let productService: ProductService;

  const mockProductService = {
    findAll: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    getDeletedPercentage: jest.fn(),
    getNonDeletedPercentage: jest.fn(),
    getLowStockProducts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const queryDto: QueryProductDto = { page: 1, limit: 10 };
      const expectedResult = mockProductResponses.paginatedProducts;

      mockProductService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(queryDto);

      expect(productService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a product by id', async () => {
      const productId = '1';

      mockProductService.remove.mockResolvedValue(undefined);

      await controller.remove(productId);

      expect(productService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('getDeletedPercentage', () => {
    it('should return deleted percentage', async () => {
      const expectedPercentage = 'Deleted percentage: 25%';

      mockProductService.getDeletedPercentage.mockResolvedValue(expectedPercentage);

      const result = await controller.getDeletedPercentage();

      expect(productService.getDeletedPercentage).toHaveBeenCalled();
      expect(result).toBe(expectedPercentage);
    });
  });

  describe('getNonDeletedPercentage', () => {
    it('should return non-deleted percentage with query', async () => {
      const queryDto: StatsQueryDto = { hasPrice: true };
      const expectedPercentage = 75;

      mockProductService.getNonDeletedPercentage.mockResolvedValue(expectedPercentage);

      const result = await controller.getNonDeletedPercentage(queryDto);

      expect(productService.getNonDeletedPercentage).toHaveBeenCalledWith(queryDto);
      expect(result).toBe(expectedPercentage);
    });
  });

  describe('getLowStockProducts', () => {
    it('should return low stock products', async () => {
      const stockThreshold: string = '10';
      const expectedProducts = mockProductResponses.lowStockProducts;

      mockProductService.getLowStockProducts.mockResolvedValue(expectedProducts);

      const result = await controller.getLowStockProducts(stockThreshold);

      expect(productService.getLowStockProducts).toHaveBeenCalledWith(10);
      expect(result).toEqual(expectedProducts);
    });
  });
});
