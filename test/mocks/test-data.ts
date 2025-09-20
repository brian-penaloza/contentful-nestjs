export const mockUsers = {
  validUser: {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword123',
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
  },
  newUser: {
    email: 'newuser@example.com',
    password: 'password123',
  },
  loginUser: {
    email: 'test@example.com',
    password: 'password123',
  },
};

export const mockExpectedResult = {
  login: {
    access_token: 'jwt-token-123',
    user: {
      id: 1,
      email: 'test@example.com',
    },
  },
  register: {
    message: 'User registered successfully',
    success: true,
  },
};

export const mockProducts = {
  validProduct: {
    id: 1,
    sku: 'TEST-001',
    name: 'Test Product',
    brand: 'Test Brand',
    model: 'Test Model',
    category: 'Test Category',
    color: 'Red',
    price: 100,
    currency: 'USD',
    stock: 10,
    isDeleted: false,
    externalId: 'external-123',
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
  },
  createProductDto: {
    sku: 'TEST-001',
    name: 'Test Product',
    brand: 'Test Brand',
    model: 'Test Model',
    category: 'Test Category',
    color: 'Red',
    price: 100,
    currency: 'USD',
    stock: 10,
    externalId: 'external-123',
  },
  contentfulProduct: {
    id: 1,
    sku: 'CF-001',
    name: 'Contentful Product 1',
    brand: 'Contentful Brand',
    model: 'Model 1',
    category: 'Category 1',
    color: 'Blue',
    price: 100,
    currency: 'USD',
    stock: 10,
    externalId: 'contentful-1',
  },
  lowStockProduct: {
    id: 2,
    sku: 'LOW-001',
    name: 'Low Stock Product',
    brand: 'Test Brand',
    model: 'Test Model',
    category: 'Test Category',
    color: 'Green',
    price: 50,
    currency: 'USD',
    stock: 5,
    isDeleted: false,
    externalId: 'external-456',
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
  },
  productList: [
    {
      id: 1,
      name: 'Product 1',
      sku: 'SKU-001',
    },
    {
      id: 2,
      name: 'Product 2',
      sku: 'SKU-002',
    },
  ],
};

export const mockContentfulData = {
  fullResponse: {
    sys: { type: 'Array' },
    total: 2,
    skip: 0,
    limit: 100,
    items: [
      {
        sys: {
          id: 'contentful-1',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
        fields: {
          sku: 'CF-001',
          name: 'External Product 1',
          brand: 'External Brand',
          model: 'Model 1',
          category: 'Category 1',
          color: 'Blue',
          price: 100,
          currency: 'USD',
          stock: 10,
        },
      },
      {
        sys: {
          id: 'contentful-2',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
        fields: {
          sku: 'CF-002',
          name: 'External Product 2',
          brand: 'External Brand',
          model: 'Model 2',
          category: 'Category 2',
          color: 'Red',
          price: 200,
          currency: 'USD',
          stock: 20,
        },
      },
    ],
  },
  singleItem: {
    sys: { type: 'Array' },
    total: 1,
    skip: 0,
    limit: 100,
    items: [
      {
        sys: {
          id: 'contentful-1',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
        fields: {
          sku: 'CF-001',
          name: 'Existing Product',
          brand: 'Test Brand',
          model: 'Test Model',
          category: 'Test Category',
          color: 'Blue',
          price: 100,
          currency: 'USD',
          stock: 10,
        },
      },
    ],
  },
  newItem: {
    sys: { type: 'Array' },
    total: 1,
    skip: 0,
    limit: 100,
    items: [
      {
        sys: {
          id: 'contentful-1',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
        fields: {
          sku: 'CF-001',
          name: 'New Product',
          brand: 'Test Brand',
          model: 'Test Model',
          category: 'Test Category',
          color: 'Red',
          price: 150,
          currency: 'USD',
          stock: 15,
        },
      },
    ],
  },
};

export const mockAuthResponses = {
  registerSuccess: {
    message: 'User created successfully',
    user: {
      id: 1,
      email: 'test@example.com',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    },
  },
  loginSuccess: {
    access_token: 'jwt-token-123',
    user: {
      id: 1,
      email: 'test@example.com',
    },
  },
};

export const mockProductResponses = {
  paginatedProducts: {
    data: [
      { id: 1, name: 'Product 1', sku: 'SKU-001' },
      { id: 2, name: 'Product 2', sku: 'SKU-002' },
    ],
    total: 2,
    page: 1,
    limit: 5,
    totalPages: 1,
  },
  singleProduct: {
    id: 1,
    name: 'Test Product',
    sku: 'TEST-001',
  },
  lowStockProducts: [
    { id: 1, name: 'Product 1', stock: 5 },
    { id: 2, name: 'Product 2', stock: 8 },
  ],
};

export const mockExternalApiResponses = {
  success: {
    items: [
      {
        sys: { id: 'contentful-1' },
        fields: {
          sku: 'CF-001',
          name: 'External Product 1',
          brand: 'External Brand',
          model: 'Model 1',
          category: 'Category 1',
          color: 'Blue',
          price: 100,
          currency: 'USD',
          stock: 10,
        },
      },
    ],
  },
};

export const mockConfigValues = {
  contentful: {
    baseUrl: 'https://api.contentful.com',
    spaceId: 'test-space-id',
    accessToken: 'test-access-token',
  },
};

export const mockJwtPayload = {
  sub: 1,
  email: 'test@example.com',
};

export const mockHashedPassword = 'hashedPassword123';
export const mockJwtToken = 'jwt-token-123';
export const mockExternalIds = ['contentful-1', 'contentful-2'];
