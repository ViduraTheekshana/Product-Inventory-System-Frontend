import { useState, useEffect, useCallback } from "react";
import { getWithHeaders } from "../../../common/api/apiClient";
import { useToast } from "../../../common/toast/useToast";
import type { ApiError } from "../../../common/types/api.types";
import type {
  Product,
  ProductStatus,
  CreateProductRequest,
  UpdateStockPriceRequest,
  PagedResult,
} from "../types/product.types";
import {
  createProduct,
  updatePriceAndStock,
  updateStatus,
  deleteProduct,
  bulkUpdateStatus,
  bulkUpdatePriceAndStock,
  bulkDeleteProducts,
} from "../api/productApi";

const PAGE_SIZE = 10;

export function useProducts() {
  const [tab, setTabState] = useState<"active" | "deleted">("active");
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { showToast } = useToast();

  // `silent` skips the loading spinner entirely - used specifically
  // after a mutation, where the table should update in place, not
  // flash to a full loading state for something the user just did.
  const fetchProducts = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoading(true);
    setError(null);

    try {
      const { data, headers } = await getWithHeaders<PagedResult<Product>>(
        buildQueryPath(tab, page, sort, search)
      );

      setProducts(data.content);
      setTotalPages(data.page.totalPages);
      setTotalElements(data.page.totalElements);

      const warning = headers.get("X-Sort-Warning");
      if (warning) {
        showToast({ type: "info", title: "Sort adjusted", message: warning, duration: 5000 });
      }
    } catch (err) {
      setError(err as ApiError);
    } finally {
      if (!options?.silent) setLoading(false);
    }
  }, [tab, page, sort, search, showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setPage(0);
  }, [search, sort]);

  function setTab(newTab: "active" | "deleted") {
    setTabState(newTab);
    setPage(0);
    setSelectedIds(new Set());
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  // Every mutation below follows the same corrected order: perform the
  // change, silently refresh the real data, THEN announce success -
  // never claim success before the visible table actually agrees.
  async function create(request: CreateProductRequest) {
    await createProduct(request);
    await fetchProducts({ silent: true });
    showToast({ type: "success", title: "Product created", duration: 3000 });
  }

  async function editPriceAndStock(id: number, request: UpdateStockPriceRequest) {
    await updatePriceAndStock(id, request);
    await fetchProducts({ silent: true });
    showToast({ type: "success", title: "Product updated", duration: 3000 });
  }

  async function changeStatus(id: number, status: ProductStatus) {
    await updateStatus(id, { status });
    await fetchProducts({ silent: true });
    showToast({ type: "success", title: "Status updated", duration: 3000 });
  }

  async function remove(id: number) {
    await deleteProduct(id);
    await fetchProducts({ silent: true });
    showToast({ type: "success", title: "Product deleted", duration: 3000 });
  }

  async function bulkChangeStatus(status: ProductStatus) {
    const count = selectedIds.size;
    await bulkUpdateStatus({ productIds: Array.from(selectedIds), status });
    clearSelection();
    await fetchProducts({ silent: true });
    showToast({ type: "success", title: `${count} products updated`, duration: 3000 });
  }

  async function bulkEditPriceAndStock(request: { price?: number; stockQuantity?: number }) {
    const count = selectedIds.size;
    await bulkUpdatePriceAndStock({ productIds: Array.from(selectedIds), ...request });
    clearSelection();
    await fetchProducts({ silent: true });
    showToast({ type: "success", title: `${count} products updated`, duration: 3000 });
  }

  async function bulkRemove() {
    const count = selectedIds.size;
    await bulkDeleteProducts({ productIds: Array.from(selectedIds) });
    clearSelection();
    await fetchProducts({ silent: true });
    showToast({ type: "success", title: `${count} products deleted`, duration: 3000 });
  }

  return {
    tab, setTab,
    products, page, setPage, totalPages, totalElements,
    search, setSearch,
    sort, setSort,
    loading, error,
    selectedIds, toggleSelect, clearSelection,
    create, editPriceAndStock, changeStatus, remove,
    bulkChangeStatus, bulkEditPriceAndStock, bulkRemove,
  };
}

function buildQueryPath(tab: "active" | "deleted", page: number, sort?: string, search?: string): string {
  const query = new URLSearchParams({ page: page.toString(), size: PAGE_SIZE.toString() });
  if (sort) query.set("sort", sort);
  if (search) query.set("search", search);
  const base = tab === "active" ? "/api/v1/products" : "/api/v1/products/deleted";
  return `${base}?${query}`;
}