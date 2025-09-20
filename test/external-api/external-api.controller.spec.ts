import { Test, TestingModule } from '@nestjs/testing';
import { ExternalApiController } from '../../src/external-api/external-api.controller';
import { ExternalApiService } from '../../src/external-api/external-api.service';
import { mockExternalApiResponses } from '../mocks/test-data';

describe('ExternalApiController', () => {
  let controller: ExternalApiController;
  let externalApiService: ExternalApiService;

  const mockExternalApiService = {
    fetchProducts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExternalApiController],
      providers: [
        {
          provide: ExternalApiService,
          useValue: mockExternalApiService,
        },
      ],
    }).compile();

    controller = module.get<ExternalApiController>(ExternalApiController);
    externalApiService = module.get<ExternalApiService>(ExternalApiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProductsFromExternal', () => {
    it('should return products from external API', async () => {
      const expectedProducts = mockExternalApiResponses.success;

      mockExternalApiService.fetchProducts.mockResolvedValue(expectedProducts);

      const result = await controller.getProductsFromExternal();

      expect(externalApiService.fetchProducts).toHaveBeenCalled();
      expect(result).toEqual(expectedProducts);
    });

    it('should handle service errors', async () => {
      const error = new Error('External API error');
      mockExternalApiService.fetchProducts.mockRejectedValue(error);

      await expect(controller.getProductsFromExternal()).rejects.toThrow('External API error');
    });
  });
});
