import { DataSource } from 'typeorm';
import { seedProducts } from './seed-products';
import { seedUsers } from './seed-users';

export async function runSeeds(dataSource: DataSource) {
  console.log('🌱 Starting database seeding...');

  try {
    console.log('👤 Seeding users...');
    await seedUsers(dataSource);

    console.log('📦 Seeding products...');
    await seedProducts(dataSource);

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}
