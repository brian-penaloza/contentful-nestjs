export interface ContentfulProduct {
  id: string;
  sku: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  color: string;
  price: number;
  currency: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentfulApiResponse {
  data: ContentfulProduct[];
  total: number;
  skip: number;
  limit: number;
}

export interface ContentfulItem {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  fields: {
    sku: string;
    name: string;
    brand: string;
    model: string;
    category: string;
    color: string;
    price: number;
    currency: string;
    stock: number;
  };
}

export interface ContentfulResponse {
  sys: {
    type: string;
  };
  total: number;
  skip: number;
  limit: number;
  items: ContentfulItem[];
}
