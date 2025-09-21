const { writeFileSync, mkdirSync } = require('fs');
const { join } = require('path');

// Generar documentación Swagger básica sin depender de la base de datos
function generateSwaggerDocs() {
  try {
    const swaggerDoc = {
      openapi: '3.0.0',
      info: {
        title: 'Contentful NestJS API',
        description: 'API para gestión de productos con integración Contentful',
        version: '1.0.0',
        contact: {
          name: 'API Support',
          email: 'support@example.com',
        },
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Servidor de desarrollo',
        },
      ],
      tags: [
        {
          name: 'auth',
          description: 'Autenticación de usuarios',
        },
        {
          name: 'products',
          description: 'Gestión de productos',
        },
        {
          name: 'external-api',
          description: 'API externa Contentful',
        },
      ],
      paths: {
        '/': {
          get: {
            tags: ['General'],
            summary: 'Información de la API',
            description: 'Obtiene información básica sobre la API',
            responses: {
              200: {
                description: 'Información de la API',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        message: { type: 'string' },
                        version: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/products': {
          get: {
            tags: ['products'],
            summary: 'Obtener productos',
            description: 'Obtiene una lista de productos con filtros opcionales',
            parameters: [
              {
                name: 'name',
                in: 'query',
                description: 'Filtrar por nombre del producto',
                schema: { type: 'string' },
              },
              {
                name: 'category',
                in: 'query',
                description: 'Filtrar por categoría',
                schema: { type: 'string' },
              },
              {
                name: 'minPrice',
                in: 'query',
                description: 'Precio mínimo',
                schema: { type: 'number' },
              },
              {
                name: 'maxPrice',
                in: 'query',
                description: 'Precio máximo',
                schema: { type: 'number' },
              },
              {
                name: 'page',
                in: 'query',
                description: 'Número de página',
                schema: { type: 'integer', default: 1 },
              },
              {
                name: 'limit',
                in: 'query',
                description: 'Elementos por página',
                schema: { type: 'integer', default: 5 },
              },
            ],
            responses: {
              200: {
                description: 'Lista de productos obtenida exitosamente',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/Product',
                          },
                        },
                        total: { type: 'integer' },
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        totalPages: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/products/{id}': {
          delete: {
            tags: ['products'],
            summary: 'Eliminar producto',
            description: 'Elimina un producto (soft delete) - Requiere autenticación',
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'ID del producto a eliminar',
                schema: { type: 'integer' },
              },
            ],
            responses: {
              200: {
                description: 'Producto eliminado exitosamente',
              },
              401: {
                description: 'No autorizado',
              },
              404: {
                description: 'Producto no encontrado',
              },
            },
          },
        },
        '/products/deleted-percentage': {
          get: {
            tags: ['products'],
            summary: 'Porcentaje de productos eliminados',
            description: 'Obtiene el porcentaje de productos eliminados - Requiere autenticación',
            security: [{ bearerAuth: [] }],
            responses: {
              200: {
                description: 'Porcentaje calculado exitosamente',
                content: {
                  'application/json': {
                    schema: {
                      type: 'string',
                      example: 'Deleted percentage: 25%',
                    },
                  },
                },
              },
              401: {
                description: 'No autorizado',
              },
            },
          },
        },
        '/products/report': {
          get: {
            tags: ['products'],
            summary: 'Reporte de productos no eliminados',
            description:
              'Obtiene el porcentaje de productos no eliminados con filtros - Requiere autenticación',
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: 'hasPrice',
                in: 'query',
                description: 'Filtrar por productos con/sin precio',
                schema: { type: 'boolean' },
              },
              {
                name: 'startDate',
                in: 'query',
                description: 'Fecha de inicio (formato: YYYY-MM-DD)',
                schema: { type: 'string', format: 'date' },
              },
              {
                name: 'endDate',
                in: 'query',
                description: 'Fecha de fin (formato: YYYY-MM-DD)',
                schema: { type: 'string', format: 'date' },
              },
            ],
            responses: {
              200: {
                description: 'Reporte generado exitosamente',
                content: {
                  'application/json': {
                    schema: {
                      type: 'string',
                      example: 'Non-deleted percentage: 75%',
                    },
                  },
                },
              },
              401: {
                description: 'No autorizado',
              },
            },
          },
        },
        '/products/low-stock': {
          get: {
            tags: ['products'],
            summary: 'Productos con stock bajo',
            description:
              'Obtiene productos con stock menor al número especificado - Requiere autenticación',
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: 'stock',
                in: 'query',
                required: true,
                description: 'Umbral de stock',
                schema: { type: 'integer' },
              },
            ],
            responses: {
              200: {
                description: 'Lista de productos con stock bajo',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Product',
                      },
                    },
                  },
                },
              },
              401: {
                description: 'No autorizado',
              },
            },
          },
        },
        '/auth/login': {
          post: {
            tags: ['auth'],
            summary: 'Iniciar sesión',
            description: 'Autentica un usuario y devuelve un token JWT',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/LoginDto',
                  },
                },
              },
            },
            responses: {
              200: {
                description: 'Login exitoso',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        access_token: { type: 'string' },
                        user: {
                          $ref: '#/components/schemas/User',
                        },
                      },
                    },
                  },
                },
              },
              401: {
                description: 'Credenciales inválidas',
              },
            },
          },
        },
        '/auth/register': {
          post: {
            tags: ['auth'],
            summary: 'Registrar usuario',
            description: 'Registra un nuevo usuario en el sistema',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/RegisterDto',
                  },
                },
              },
            },
            responses: {
              201: {
                description: 'Usuario registrado exitosamente',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
              400: {
                description: 'Datos de registro inválidos',
              },
            },
          },
        },
        '/external/products': {
          get: {
            tags: ['external-api'],
            summary: 'Obtener productos externos',
            description: 'Obtiene datos directamente del endpoint externo de Contentful',
            responses: {
              200: {
                description: 'Datos externos obtenidos exitosamente',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        items: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/ContentfulItem',
                          },
                        },
                        total: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
          },
        },
        schemas: {
          Product: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              sku: { type: 'string' },
              name: { type: 'string' },
              brand: { type: 'string' },
              model: { type: 'string' },
              category: { type: 'string' },
              color: { type: 'string' },
              price: { type: 'string' },
              currency: { type: 'string' },
              stock: { type: 'integer' },
              isDeleted: { type: 'boolean' },
              externalId: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              email: { type: 'string', format: 'email' },
              name: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          LoginDto: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: { type: 'string', format: 'email' },
              password: { type: 'string', minLength: 6 },
            },
          },
          RegisterDto: {
            type: 'object',
            required: ['email', 'password', 'name'],
            properties: {
              email: { type: 'string', format: 'email' },
              password: { type: 'string', minLength: 6 },
              name: { type: 'string' },
            },
          },
          ContentfulItem: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              brand: { type: 'string' },
              model: { type: 'string' },
              category: { type: 'string' },
              color: { type: 'string' },
              price: { type: 'string' },
              currency: { type: 'string' },
              stock: { type: 'integer' },
            },
          },
        },
      },
    };

    // Crear carpeta docs si no existe
    const docsDir = join(process.cwd(), 'docs');
    mkdirSync(docsDir, { recursive: true });

    // Guardar JSON
    const jsonPath = join(docsDir, 'swagger.json');
    writeFileSync(jsonPath, JSON.stringify(swaggerDoc, null, 2));

    console.log('✅ Documentación Swagger generada en:', jsonPath);
  } catch (error) {
    console.error('❌ Error generando documentación:', error);
    process.exit(1);
  }
}

generateSwaggerDocs();
