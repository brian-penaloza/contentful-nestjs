const { NestFactory } = require('@nestjs/core');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const { writeFileSync, mkdirSync } = require('fs');
const { join } = require('path');
const { AppModule } = require('../dist/app.module');

async function generateSwaggerDocs() {
  try {
    // Crear la aplicación
    const app = await NestFactory.create(AppModule);
    
    // Configurar Swagger
    const config = new DocumentBuilder()
      .setTitle('Contentful NestJS API')
      .setDescription('API para gestión de productos con integración Contentful')
      .setVersion('1.0')
      .addTag('auth', 'Autenticación de usuarios')
      .addTag('products', 'Gestión de productos')
      .addTag('external-api', 'API externa Contentful')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth'
      )
      .build();

    // Generar documentación
    const document = SwaggerModule.createDocument(app, config);
    
    // Crear carpeta docs si no existe
    const docsDir = join(process.cwd(), 'docs');
    mkdirSync(docsDir, { recursive: true });
    
    // Guardar JSON
    const jsonPath = join(docsDir, 'swagger.json');
    writeFileSync(jsonPath, JSON.stringify(document, null, 2));
    
    console.log('✅ Documentación Swagger generada en:', jsonPath);
    
    // Cerrar la aplicación
    await app.close();
    
  } catch (error) {
    console.error('❌ Error generando documentación:', error);
    process.exit(1);
  }
}

generateSwaggerDocs();
