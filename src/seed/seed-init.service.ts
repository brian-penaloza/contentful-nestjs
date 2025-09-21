import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { runSeeds } from './seed';

@Injectable()
export class SeedInitService implements OnModuleInit {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    // Solo ejecutar seed en desarrollo o si no hay datos
    if (process.env.NODE_ENV === 'development' || process.env.AUTO_SEED === 'true') {
      try {
        console.log('🌱 Checking if database needs seeding...');

        // Verificar si la base de datos está disponible
        if (!this.dataSource.isInitialized) {
          console.log('⏳ Database not initialized yet, skipping seed check');
          return;
        }

        // Verificar si ya hay datos
        const userCount = await this.dataSource.getRepository('User').count();
        const productCount = await this.dataSource.getRepository('Product').count();

        if (userCount === 0 && productCount === 0) {
          console.log('📊 Database is empty, starting seeding...');
          await runSeeds(this.dataSource);
        } else {
          console.log('✅ Database already has data, skipping seeding');
        }
      } catch (error) {
        console.error('❌ Error during automatic seeding:', error);
        // No lanzar error para no romper la aplicación
      }
    }
  }
}
