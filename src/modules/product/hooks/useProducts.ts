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

  // useCallback keeps this function's identity stable between renders,
  // unless one of its dependencies actually changes. Without it, a new
  // fetchProducts function would be created on every single render,
  // which would make the useEffect below re-run constantly, even when
  // nothing relevant actually changed.
  const fetchProducts = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
    }
  }, [tab, page, sort, search, showToast]);

  // Re-fetches automatically whenever any of these values change - a
  // page click, a tab switch, a new search term, or a new sort all
  // trigger exactly this one effect, never scattered fetch calls
  // sprinkled through the component that uses this hook.
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  async function create(request: CreateProductRequest) {
    await createProduct(request);
    showToast({ type: "success", title: "Product created", duration: 3000 });
    await fetchProducts();
  }

  async function editPriceAndStock(id: number, request: UpdateStockPriceRequest) {
    await updatePriceAndStock(id, request);
    showToast({ type: "success", title: "Product updated", duration: 3000 });
    await fetchProducts();
  }

  async function changeStatus(id: number, status: ProductStatus) {
    await updateStatus(id, { status });
    showToast({ type: "success", title: "Status updated", duration: 3000 });
    await fetchProducts();
  }

  async function remove(id: number) {
    await deleteProduct(id);
    showToast({ type: "success", title: "Product deleted", duration: 3000 });
    await fetchProducts();
  }

  async function bulkChangeStatus(status: ProductStatus) {
    await bulkUpdateStatus({ productIds: Array.from(selectedIds), status });
    showToast({ type: "success", title: `${selectedIds.size} products updated`, duration: 3000 });
    clearSelection();
    await fetchProducts();
  }

  async function bulkEditPriceAndStock(request: { price?: number; stockQuantity?: number }) {
    await bulkUpdatePriceAndStock({ productIds: Array.from(selectedIds), ...request });
    showToast({ type: "success", title: `${selectedIds.size} products updated`, duration: 3000 });
    clearSelection();
    await fetchProducts();
  }

  async function bulkRemove() {
    await bulkDeleteProducts({ productIds: Array.from(selectedIds) });
    showToast({ type: "success", title: `${selectedIds.size} products deleted`, duration: 3000 });
    clearSelection();
    await fetchProducts();
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