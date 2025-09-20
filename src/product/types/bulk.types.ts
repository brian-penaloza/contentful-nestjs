export interface BulkCreateResult {
  success: boolean;
  totalProcessed: number;
  created: number;
  skipped: number;
  errorCount: number;
  createdProducts: ProductSummary[];
  skippedProducts: ProductSummary[];
  errors: BulkError[];
}

export interface ProductSummary {
  sku: string;
  name: string;
  reason?: string;
}

export interface BulkError {
  sku: string;
  name: string;
  error: string;
  index: number;
}

export interface BulkValidationResult {
  isValid: boolean;
  errors: string[];
  duplicateSkus: string[];
}
