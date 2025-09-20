import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ProductService } from '../product/product.service';
import { lastValueFrom } from 'rxjs';
import {
  ContentfulApiResponse,
  ContentfulResponse,
  ContentfulItem,
} from './types/contentful.types';

@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly productService: ProductService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async fetchAndSaveProducts() {
    try {
      this.logger.log('Starting scheduled fetch from Contentful API...');

      const contentfulData = await this.getProducts();
      const products = contentfulData.items || [];

      const externalIds = products.map(item => item.sys.id);
      const existingExternalIds = await this.productService.getExistingExternalIds(externalIds);

      const newProducts = products.filter(item => !existingExternalIds.includes(item.sys.id));

      if (newProducts.length > 0) {
        try {
          await this.productService.bulkCreateFromContentful(newProducts);
          this.logger.log(
            `Successfully processed ${newProducts.length} new products from Contentful API`,
          );
        } catch (error) {
          this.logger.error('Error bulk saving products:', error);
        }
      } else {
        this.logger.log('No new products to save from Contentful API');
      }
    } catch (error) {
      this.logger.error('Error fetching from Contentful API:', error);
    }
  }

  async fetchProducts(): Promise<ContentfulApiResponse> {
    try {
      const contentfulData = await this.getProducts();
      const transformedProducts =
        contentfulData.items?.map((item: ContentfulItem) => ({
          id: item.sys.id,
          ...item.fields,
          createdAt: item.sys.createdAt,
          updatedAt: item.sys.updatedAt,
        })) || [];

      return {
        data: transformedProducts,
        total: contentfulData.total || 0,
        skip: contentfulData.skip || 0,
        limit: contentfulData.limit || 0,
      };
    } catch (error) {
      this.logger.error('Error fetching from Contentful API:', error);
      throw error;
    }
  }

  async getProducts(): Promise<ContentfulResponse> {
    const baseUrl = this.configService.get<string>('CONTENTFUL_BASE_URL') || '';
    const spaceId = this.configService.get<string>('CONTENTFUL_SPACE_ID') || '';
    const environment = this.configService.get<string>('CONTENTFUL_ENVIRONMENT') || '';
    const contentType = this.configService.get<string>('CONTENTFUL_CONTENT_TYPE') || '';
    const accessToken = this.configService.get<string>('CONTENTFUL_ACCESS_TOKEN') || '';
    const route = `spaces/${spaceId}/environments/${environment}/entries`;
    const parameters = `access_token=${accessToken}&content_type=${contentType}`;
    const apiUrl = `${baseUrl}/${route}?${parameters}`;

    this.logger.log(`apiUrl, ${apiUrl}`);

    const { data: contentfulData } = await lastValueFrom(
      this.httpService.get<ContentfulResponse>(apiUrl),
    );
    this.logger.log(`Found ${contentfulData.items.length} products in Contentful`);
    return contentfulData;
  }
}
