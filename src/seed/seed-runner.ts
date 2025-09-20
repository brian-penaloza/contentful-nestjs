import { DataSource } from 'typeorm';
import { runSeeds } from './seed';

export async function runDatabaseSeeds() {
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
    console.log('📊 Database connection established');

    await runSeeds(dataSource);

    await dataSource.destroy();
    console.log('🔌 Database connection closed');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  }
}
