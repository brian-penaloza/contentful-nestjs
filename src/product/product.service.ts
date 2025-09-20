import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThanOrEqual, IsNull } from 'typeorm';
import { Product } from './entities/product.entity';
import { QueryProductDto } from './dto/query-product.dto';
import { StatsQueryDto } from './dto/stats-query.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(queryDto: QueryProductDto) {
    const {
      sku,
      name,
      brand,
      model,
      category,
      color,
      minPrice,
      maxPrice,
      currency,
      page = 1,
      limit = 5,
    } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository.createQueryBuilder('product');
    // .where('product.isDeleted = :isDeleted', { isDeleted: false });

    if (sku) {
      queryBuilder.andWhere('product.sku ILIKE :sku', { sku: `%${sku}%` });
    }

    if (name) {
      queryBuilder.andWhere('product.name ILIKE :name', { name: `%${name}%` });
    }

    if (brand) {
      queryBuilder.andWhere('product.brand ILIKE :brand', {
        brand: `%${brand}%`,
      });
    }

    if (model) {
      queryBuilder.andWhere('product.model ILIKE :model', {
        model: `%${model}%`,
      });
    }

    if (category) {
      queryBuilder.andWhere('product.category ILIKE :category', {
        category: `%${category}%`,
      });
    }

    if (color) {
      queryBuilder.andWhere('product.color ILIKE :color', {
        color: `%${color}%`,
      });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (currency) {
      queryBuilder.andWhere('product.currency = :currency', { currency });
    }

    const [products, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    product.isDeleted = true;
    await this.productRepository.save(product);
  }

  async getDeletedPercentage(): Promise<string> {
    const totalProducts = await this.productRepository.count();
    const deletedProducts = await this.productRepository.count({
      where: { isDeleted: true },
    });

    const percentage = totalProducts > 0 ? (deletedProducts / totalProducts) * 100 : 0;
    return `Deleted percentage: ${percentage}%`;
  }

  async getNonDeletedPercentage(queryDto: StatsQueryDto): Promise<number> {
    const { hasPrice, startDate, endDate } = queryDto;

    const whereCondition: any = { isDeleted: false };

    if (hasPrice !== undefined) {
      if (hasPrice) {
        whereCondition.price = MoreThanOrEqual(0);
      } else {
        whereCondition.price = IsNull();
      }
    }

    if (startDate && endDate) {
      whereCondition.createdAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      whereCondition.createdAt = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      whereCondition.createdAt = LessThan(new Date(endDate));
    }

    const nonDeletedProducts = await this.productRepository.count({
      where: whereCondition,
    });

    const totalProducts = await this.productRepository.count();

    return totalProducts > 0 ? (nonDeletedProducts / totalProducts) * 100 : 0;
  }

  async getLowStockProducts(queryDto: number): Promise<Product[]> {
    return this.productRepository.find({
      where: {
        stock: LessThan(queryDto),
        isDeleted: false,
      },
    });
  }

  async createOrUpdateFromExternal(externalProduct: any): Promise<Product> {
    const existingProduct = await this.productRepository.findOne({
      where: { externalId: externalProduct.id.toString() },
    });

    const sku = `EXT-${externalProduct.id}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    if (existingProduct) {
      existingProduct.sku = sku;
      existingProduct.name = externalProduct.title;
      existingProduct.brand = externalProduct.brand || 'Unknown';
      existingProduct.model = externalProduct.title;
      existingProduct.category = externalProduct.category;
      existingProduct.color = externalProduct.color || 'Unknown';
      existingProduct.price = externalProduct.price;
      existingProduct.currency = 'USD';
      existingProduct.stock = Math.floor(Math.random() * 50) + 1;
      return this.productRepository.save(existingProduct);
    }

    const newProduct = this.productRepository.create({
      sku: sku,
      name: externalProduct.title,
      brand: externalProduct.brand || 'Unknown',
      model: externalProduct.title,
      category: externalProduct.category,
      color: externalProduct.color || 'Unknown',
      price: externalProduct.price,
      currency: 'USD',
      externalId: externalProduct.id.toString(),
      stock: Math.floor(Math.random() * 50) + 1,
    });

    return this.productRepository.save(newProduct);
  }

  async createOrUpdateFromContentful(contentfulItem: any): Promise<Product> {
    const contentfulId = contentfulItem.sys.id;
    const productData = this.mapContentfulItemToProduct(contentfulItem);

    const existingProduct = await this.productRepository.findOne({
      where: { externalId: contentfulId },
    });

    if (existingProduct) {
      Object.assign(existingProduct, productData);
      return this.productRepository.save(existingProduct);
    }

    const newProduct = this.productRepository.create(productData);
    return this.productRepository.save(newProduct);
  }

  async findByExternalId(externalId: string): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { externalId },
    });
  }

  async getExistingExternalIds(externalIds: string[]): Promise<string[]> {
    const existingProducts = await this.productRepository
      .createQueryBuilder('product')
      .select('product.externalId')
      .where('product.externalId IN (:...externalIds)', { externalIds })
      .getMany();

    return existingProducts.map(product => product.externalId);
  }

  async bulkCreateFromContentful(contentfulItems: any[]): Promise<Product[]> {
    const products = contentfulItems.map(item => {
      return this.mapContentfulItemToProduct(item);
    });

    return this.productRepository.save(products);
  }

  private mapContentfulItemToProduct(contentfulItem: any): Partial<Product> {
    const fields = contentfulItem.fields;

    return {
      sku: fields.sku,
      name: fields.name,
      brand: fields.brand,
      model: fields.model,
      category: fields.category,
      color: fields.color,
      price: fields.price,
      currency: fields.currency || 'USD',
      stock: fields.stock || 0,
      externalId: contentfulItem.sys.id,
    };
  }
}
