import { DataSource } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import * as fs from 'fs';
import * as path from 'path';

export async function seedProducts(dataSource: DataSource) {
  const productRepository = dataSource.getRepository(Product);
  const productsFilePath = path.join(process.cwd(), 'data', 'products.json');

  try {
    const productsData = JSON.parse(fs.readFileSync(productsFilePath, 'utf8'));
    const sampleProducts: Partial<Product>[] = productsData.products;

    if (!Array.isArray(sampleProducts)) {
      throw new Error("Invalid products data format. Expected 'products' to be an array.");
    }

    for (const productData of sampleProducts) {
      const existingProduct = await productRepository.findOne({
        where: { externalId: productData.externalId },
      });

      if (!existingProduct) {
        const savedProduct = await productRepository.save(productData);
        console.log(`✅ Created product: ${savedProduct.name} (SKU: ${savedProduct.externalId})`);
      } else {
        console.log(
          `⚠️  Product already exists: ${productData.name} (SKU: ${productData.externalId})`,
        );
      }
    }

    console.log(`📦 Seeded ${sampleProducts.length} products from data/products.json`);
  } catch (error) {
    console.error('❌ Error reading products data file:', error.message);
    throw error;
  }
}
