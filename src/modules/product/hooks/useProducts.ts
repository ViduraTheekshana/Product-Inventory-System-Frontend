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

  const { showToast } = useToast();

  // A "ref" is a box that holds a value which survives between renders,
  // but - unlike useState - changing it does NOT cause a re-render.
  // We use it here purely as a note-to-self: "the next time fetchProducts
  // runs, skip the big loading spinner." We set this flag right before
  // a search-driven update, and fetchProducts reads + clears it immediately.
  const skipLoadingRef = useRef(false);

  // `silent` skips the loading spinner entirely - used specifically
  // after a mutation, where the table should update in place, not
  // flash to a full loading state for something the user just did.
  const fetchProducts = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent || skipLoadingRef.current;
    skipLoadingRef.current = false; // one-time use, then reset
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

  // Sorting still resets to page 0 and still shows the loading spinner -
  // clicking a column header is a deliberate action, so a brief loading
  // state there is expected and fine. Search is handled separately below.
  useEffect(() => {
    setPage(0);
  }, [sort]);

  function setTab(newTab: "active" | "deleted") {
    setTabState(newTab);
    setPage(0);
    setSelectedIds(new Set());
  }

  // This REPLACES the old pattern of "setSearch, then a separate effect
  // resets the page." Doing both updates in this one function means
  // React applies them together in a single render - so fetchProducts
  // only becomes "new" once, not twice, which is what was causing the
  // double-fetch you noticed. We also set skipLoadingRef here so the
  // fetch that follows stays silent (no spinner flash) since the user
  // is just typing, not performing an explicit navigation action.
  function updateSearch(value: string) {
    skipLoadingRef.current = true;
    setSearch(value);
    setPage(0);
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
    search, setSearch: updateSearch,
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