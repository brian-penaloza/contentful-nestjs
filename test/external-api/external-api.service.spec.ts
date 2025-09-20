import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';

import { ExternalApiService } from '../../src/external-api/external-api.service';
import { ProductService } from '../../src/product/product.service';
import { mockConfigValues, mockContentfulData, mockExternalIds } from '../mocks/test-data';

describe('ExternalApiService', () => {
  let service: ExternalApiService;
  let _httpService: HttpService;
  let _productService: ProductService;
  let _configService: ConfigService;

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockProductService = {
    findByExternalId: jest.fn(),
    bulkCreateFromContentful: jest.fn(),
    getExistingExternalIds: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExternalApiService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ProductService,
          useValue: mockProductService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ExternalApiService>(ExternalApiService);
    _httpService = module.get<HttpService>(HttpService);
    _productService = module.get<ProductService>(ProductService);
    _configService = module.get<ConfigService>(ConfigService);

    // Mock logger
    Object.defineProperty(service, 'logger', {
      value: mockLogger,
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should fetch products from external API successfully', async () => {
      const mockResponse = {
        data: mockContentfulData.fullResponse,
      };

      mockConfigService.get
        .mockReturnValueOnce(mockConfigValues.contentful.baseUrl)
        .mockReturnValueOnce(mockConfigValues.contentful.spaceId)
        .mockReturnValueOnce(mockConfigValues.contentful.accessToken);

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getProducts();

      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.contentful.com/spaces/test-space-id/environments/test-access-token/entries?access_token=&content_type=',
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API error', async () => {
      const error = new Error('API Error');
      mockConfigService.get
        .mockReturnValueOnce(mockConfigValues.contentful.baseUrl)
        .mockReturnValueOnce(mockConfigValues.contentful.spaceId)
        .mockReturnValueOnce(mockConfigValues.contentful.accessToken);

      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getProducts()).rejects.toThrow('API Error');
    });
  });

  describe('fetchAndSaveProducts', () => {
    it('should fetch and save new products successfully', async () => {
      const existingExternalIds = ['contentful-1'];
      const newProducts = [mockContentfulData.fullResponse.items[1]];
      const savedProducts = [{ id: 1, ...newProducts[0] }];

      jest.spyOn(service, 'getProducts').mockResolvedValue(mockContentfulData.fullResponse);
      mockProductService.getExistingExternalIds.mockResolvedValue(existingExternalIds);
      mockProductService.bulkCreateFromContentful.mockResolvedValue(savedProducts);

      await service.fetchAndSaveProducts();

      expect(service.getProducts).toHaveBeenCalled();
      expect(mockProductService.getExistingExternalIds).toHaveBeenCalledWith(mockExternalIds);
      expect(mockProductService.bulkCreateFromContentful).toHaveBeenCalledWith(newProducts);
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Successfully processed 1 new products from Contentful API',
      );
    });

    it('should handle case when no new products to save', async () => {
      const existingExternalIds = ['contentful-1'];

      jest.spyOn(service, 'getProducts').mockResolvedValue(mockContentfulData.singleItem);
      mockProductService.getExistingExternalIds.mockResolvedValue(existingExternalIds);

      await service.fetchAndSaveProducts();

      expect(service.getProducts).toHaveBeenCalled();
      expect(mockProductService.getExistingExternalIds).toHaveBeenCalledWith(['contentful-1']);
      expect(mockProductService.bulkCreateFromContentful).not.toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith('No new products to save from Contentful API');
    });

    it('should handle error during fetch', async () => {
      const error = new Error('Fetch error');
      jest.spyOn(service, 'getProducts').mockRejectedValue(error);

      await service.fetchAndSaveProducts();

      expect(mockLogger.error).toHaveBeenCalledWith('Error fetching from Contentful API:', error);
    });

    it('should handle error during bulk save', async () => {
      const error = new Error('Save error');

      jest.spyOn(service, 'getProducts').mockResolvedValue(mockContentfulData.newItem);
      mockProductService.getExistingExternalIds.mockResolvedValue([]);
      mockProductService.bulkCreateFromContentful.mockRejectedValue(error);

      await service.fetchAndSaveProducts();

      expect(mockLogger.error).toHaveBeenCalledWith('Error bulk saving products:', error);
    });
  });
});
