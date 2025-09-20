import { DataSource } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { User } from '../auth/entities/user.entity';

export async function cleanDatabase() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'contentful_db',
    entities: ['src/**/*.entity.ts'],
    synchronize: true,
  });

  try {
    await dataSource.initialize();
    console.log('🗑️  Database connection established for cleaning');

    const productRepository = dataSource.getRepository(Product);
    await productRepository.clear();
    console.log('✅ Products table cleaned');

    const userRepository = dataSource.getRepository(User);
    await userRepository.clear();
    console.log('✅ Users table cleaned');

    await dataSource.destroy();
    console.log('🔌 Database connection closed');
    console.log('🧹 Database cleaning completed!');
  } catch (error) {
    console.error('❌ Error during database cleaning:', error);
    process.exit(1);
  }
}
