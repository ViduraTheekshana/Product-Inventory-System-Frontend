// Mirrors ProductStatus.java exactly - a TypeScript "union type" of
// string literals, not a full enum, since this is simpler and works
// identically for our purposes.
export type ProductStatus = "ACTIVE" | "INACTIVE" | "DELETED";

// Matches ProductResponse.java (a Java record) field for field.
export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

// Matches CreateProductRequest.java.
export interface CreateProductRequest {
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
}

// Matches UpdateStockPriceRequest.java - both fields optional, since
// the backend allows updating just one or the other.
export interface UpdateStockPriceRequest {
  price?: number;
  stockQuantity?: number;
}

// Matches UpdateProductStatusRequest.java.
export interface UpdateStatusRequest {
  status: ProductStatus;
}

// Matches BulkStatusUpdateRequest.java.
export interface BulkStatusUpdateRequest {
  productIds: number[];
  status: ProductStatus;
}

// Matches BulkPriceStockUpdateRequest.java.
export interface BulkPriceStockUpdateRequest {
  productIds: number[];
  price?: number;
  stockQuantity?: number;
}

// Matches BulkDeleteRequest.java.
export interface BulkDeleteRequest {
  productIds: number[];
}

// Matches the real shape Spring's Page<T> serializes to, confirmed
// back when we hit the "$.totalElements" test failure - the pagination
// metadata sits nested under "page", not flat at the top level.
export interface PagedResult<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}