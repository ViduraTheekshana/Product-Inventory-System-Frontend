import { useState, useEffect, useCallback, useRef } from "react";
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
  const [selectedProductsMap, setSelectedProductsMap] = useState<Map<number, Product>>(new Map());

  const { showToast } = useToast();

  const skipLoadingRef = useRef(false);

  const fetchProducts = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent || skipLoadingRef.current;
    skipLoadingRef.current = false;
    if (!silent) setLoading(true);
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
      if (!silent) setLoading(false);
    }
  }, [tab, page, sort, search, showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setPage(0);
  }, [sort]);

  // useCallback here matters for a DIFFERENT reason than fetchProducts
  // above - setTab is never put in another effect's dependency array,
  // so it wasn't causing bugs, but memoizing it too is good hygiene
  // now that we're being careful about this pattern.
  const setTab = useCallback((newTab: "active" | "deleted") => {
    setTabState(newTab);
    setPage(0);
    setSelectedIds(new Set());
    setSelectedProductsMap(new Map());
  }, []);

  // THE ACTUAL FIX: wrapping this in useCallback with an empty
  // dependency array gives it ONE stable identity for the component's
  // whole lifetime - it only ever calls setSearch/setPage (React's own
  // setters, always stable) and writes to a ref (also always the same
  // object). Nothing it depends on ever changes, so it never needs a
  // new identity. This is what stops ProductListPage's
  // `useEffect(() => setSearch(debouncedSearch), [debouncedSearch, setSearch])`
  // from firing on every unrelated re-render - previously, THIS
  // function got a new identity every time fetchProducts completed,
  // which made that effect think "setSearch changed" and re-run itself
  // automatically, seconds after the real request, with no typing
  // involved. That was the actual cause of your "milliseconds apart"
  // duplicate fetch.
  const updateSearch = useCallback((value: string) => {
    skipLoadingRef.current = true;
    setSearch(value);
    setPage(0);
  }, []);

  function toggleSelect(product: Product) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(product.id) ? next.delete(product.id) : next.add(product.id);
      return next;
    });
    setSelectedProductsMap((prev) => {
      const next = new Map(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
      } else {
        next.set(product.id, product);
      }
      return next;
    });
  }

  function removeFromSelection(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setSelectedProductsMap((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
    setSelectedProductsMap(new Map());
  }

  const selectedProducts = Array.from(selectedProductsMap.values());

  async function create(request: CreateProductRequest) {
    await createProduct(request);
    await fetchProducts({ silent: true });
    showToast({ type: "success", title: "Product created", duration: 3000 });
  }

  async function editPriceAndStock(id: number, request: UpdateStockPriceRequest) {
    await updatePriceAndStock(id, request);
    await fetchProducts({ silent: true });

    setSelectedProductsMap((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Map(prev);
      const existing = next.get(id)!;
      next.set(id, {
        ...existing,
        price: request.price ?? existing.price,
        stockQuantity: request.stockQuantity ?? existing.stockQuantity,
      });
      return next;
    });

    showToast({ type: "success", title: "Product updated", duration: 3000 });
  }

  async function changeStatus(id: number, status: ProductStatus) {
    await updateStatus(id, { status });
    await fetchProducts({ silent: true });

    setSelectedProductsMap((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Map(prev);
      const existing = next.get(id)!;
      next.set(id, { ...existing, status });
      return next;
    });

    showToast({ type: "success", title: "Status updated", duration: 3000 });
  }

  async function remove(id: number) {
    await deleteProduct(id);
    await fetchProducts({ silent: true });
    removeFromSelection(id);
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
    search, setSearch: updateSearch,
    sort, setSort,
    loading, error,
    selectedIds, selectedProducts, toggleSelect, removeFromSelection, clearSelection,
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