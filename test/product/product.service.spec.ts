import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThanOrEqual } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

import { ProductService } from '../../src/product/product.service';
import { Product } from '../../src/product/entities/product.entity';
import { QueryProductDto } from '../../src/product/dto/query-product.dto';
import { StatsQueryDto } from '../../src/product/dto/stats-query.dto';
import { mockProducts, mockProductResponses, mockContentfulData } from '../mocks/test-data';

describe('ProductService', () => {
  let service: ProductService;
  let _productRepository: Repository<Product>;

  const mockProductRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    select: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    _productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated products with default parameters', async () => {
      const queryDto: QueryProductDto = {};

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockProducts.productList, 2]);

      const result = await service.findAll(queryDto);

      // Note: The isDeleted filter is commented out in the actual service
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockProductResponses.paginatedProducts);
    });

    it('should filter products by name', async () => {
      const queryDto: QueryProductDto = {
        name: 'iPhone',
        page: 1,
        limit: 10,
      };

      const mockProducts = [{ id: 1, name: 'iPhone 13', sku: 'IPH-001' }];
      const total = 1;

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockProducts, total]);

      const result = await service.findAll(queryDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('product.name ILIKE :name', {
        name: '%iPhone%',
      });
      expect(result.data).toEqual(mockProducts);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const productId = 1;
      const mockProduct = {
        id: productId,
        name: 'Test Product',
        sku: 'TEST-001',
        isDeleted: false,
      };

      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne(productId);

      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId, isDeleted: false },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      const productId = 999;

      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(productId)).rejects.toThrow(
        new NotFoundException(`Product with ID ${productId} not found`),
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a product', async () => {
      const productId = 1;
      const mockProduct = {
        id: productId,
        name: 'Test Product',
        sku: 'TEST-001',
        isDeleted: false,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduct as Product);
      mockProductRepository.save.mockResolvedValue({ ...mockProduct, isDeleted: true });

      await service.remove(productId);

      expect(service.findOne).toHaveBeenCalledWith(productId);
      expect(mockProductRepository.save).toHaveBeenCalledWith({
        ...mockProduct,
        isDeleted: true,
      });
    });
  });

  describe('getDeletedPercentage', () => {
    it('should return correct percentage of deleted products', async () => {
      const totalProducts = 100;
      const deletedProducts = 25;

      mockProductRepository.count
        .mockResolvedValueOnce(totalProducts)
        .mockResolvedValueOnce(deletedProducts);

      const result = await service.getDeletedPercentage();

      expect(mockProductRepository.count).toHaveBeenCalledTimes(2);
      expect(result).toBe("Deleted percentage: 25%");
    });

    it('should return 0 if no products exist', async () => {
      mockProductRepository.count.mockResolvedValue(0);

      const result = await service.getDeletedPercentage();

      expect(result).toBe("Deleted percentage: 0%");
    });
  });

  describe('getNonDeletedPercentage', () => {
    it('should return correct percentage with hasPrice filter', async () => {
      const queryDto: StatsQueryDto = { hasPrice: true };
      const nonDeletedProducts = 80;
      const totalProducts = 100;

      mockProductRepository.count
        .mockResolvedValueOnce(nonDeletedProducts)
        .mockResolvedValueOnce(totalProducts);

      const result = await service.getNonDeletedPercentage(queryDto);

      expect(mockProductRepository.count).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          price: MoreThanOrEqual(0),
        },
      });
      expect(result).toBe(80);
    });
  });

  describe('getLowStockProducts', () => {
    it('should return products with stock less than 10', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', stock: 5 },
        { id: 2, name: 'Product 2', stock: 8 },
      ];

      mockProductRepository.find.mockResolvedValue(mockProducts);

      const result = await service.getLowStockProducts(10);

      expect(mockProductRepository.find).toHaveBeenCalledWith({
        where: {
          stock: LessThan(10),
          isDeleted: false,
        },
      });
      expect(result).toEqual(mockProducts);
    });
  });

  describe('bulkCreateFromContentful', () => {
    it('should create products from Contentful items', async () => {
      const contentfulItems = mockContentfulData.fullResponse.items;
      const expectedProducts = [
        {
          sku: 'CF-001',
          name: 'External Product 1',
          brand: 'External Brand',
          model: 'Model 1',
          category: 'Category 1',
          color: 'Blue',
          price: 100,
          currency: 'USD',
          stock: 10,
          externalId: 'contentful-1',
        },
        {
          sku: 'CF-002',
          name: 'External Product 2',
          brand: 'External Brand',
          model: 'Model 2',
          category: 'Category 2',
          color: 'Red',
          price: 200,
          currency: 'USD',
          stock: 20,
          externalId: 'contentful-2',
        },
      ];

      mockProductRepository.create.mockReturnValue(expectedProducts[0]);
      mockProductRepository.save.mockResolvedValue(expectedProducts);

      const result = await service.bulkCreateFromContentful(contentfulItems);

      expect(mockProductRepository.save).toHaveBeenCalledWith(expectedProducts);
      expect(result).toEqual(expectedProducts);
    });
  });
});
