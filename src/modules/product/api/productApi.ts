import { apiClient } from "../../../common/api/apiClient";
import type {
    Product,
    CreateProductRequest,
    UpdateStockPriceRequest,
    UpdateStatusRequest,
    BulkStatusUpdateRequest,
    BulkPriceStockUpdateRequest,
    BulkDeleteRequest,
    PagedResult
} from "../types/product.types";


// Matches GET /api/v1/products - page, size, sort are handled entirely
// by react-query/URLSearchParams below, never hand-built as a string.
export function getAllProducts(params: {
    page: number;
    size: number;
    sort?: string;
    search?: string;
}): Promise<PagedResult<Product>> {
    const query = new URLSearchParams({
        page: params.page.toString(),
        size: params.size.toString(),
    });

    if (params.sort) query.set("sort", params.sort);
    if (params.search) query.set("search", params.search);

    return apiClient.get<PagedResult<Product>>(`/api/v1/products?${query}`);
}

// Matches GET /api/v1/products/deleted.
export function getDeletedProducts(param: {
    page: number;
    size: number;
    sort?: string;
}): Promise<PagedResult<Product>> {
    const query = new URLSearchParams({

        page: param.page.toString(),
        size: param.size.toString(),

    });

    if (param.sort) query.set("sort", param.sort);

    return apiClient.get<PagedResult<Product>>(`/api/v1/products/deleted?${query}`);
}

// Matches POST /api/v1/products.
export function createProduct (request: CreateProductRequest): Promise<Product> {
    return apiClient.post<Product>("/api/v1/products", request);
}

// Matches PATCH /api/v1/products/{id}.
export function updatePriceAndStock(id: number, request: UpdateStockPriceRequest): Promise<Product> {
  return apiClient.patch<Product>(`/api/v1/products/${id}`, request);
}

// Matches PATCH /api/v1/products/{id}/status.
export function updateStatus(id: number, request: UpdateStatusRequest): Promise<Product> {
  return apiClient.patch<Product>(`/api/v1/products/${id}/status`, request);
}

// Matches DELETE /api/v1/products/{id}.
export function deleteProduct(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/v1/products/${id}`);
}

// Matches PATCH /api/v1/products/bulk-status.
export function bulkUpdateStatus(request: BulkStatusUpdateRequest): Promise<Product[]> {
  return apiClient.patch<Product[]>("/api/v1/products/bulk-status", request);
}

// Matches PATCH /api/v1/products/bulk-price-stock.
export function bulkUpdatePriceAndStock(request: BulkPriceStockUpdateRequest): Promise<Product[]> {
  return apiClient.patch<Product[]>("/api/v1/products/bulk-price-stock", request);
}

// Matches DELETE /api/v1/products/bulk.
export function bulkDeleteProducts(request: BulkDeleteRequest): Promise<void> {
  return apiClient.delete<void>("/api/v1/products/bulk", request);
} 