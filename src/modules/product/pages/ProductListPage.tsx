import { useState, useEffect } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { useProducts } from "../hooks/useProducts";
import { ProductRow } from "../components/ProductRow";
import { SelectedPanel } from "../components/SelectedPanel";
import { CreateProductPanel } from "../components/CreateProductPanel";
import { LoadingSpinner } from "../../../common/components/LoadingSpinner";
import { ErrorBanner } from "../../../common/components/ErrorBanner";
import { useDebouncedValue } from "../../../common/hooks/useDebouncedValue";

export function ProductListPage() {
  const { role } = useAuth();
  const canEdit = role === "MANAGER" || role === "ADMIN";
  const canSeeDeletedTab = canEdit;

  const {
    tab, setTab,
    products, page, setPage, totalPages, totalElements,
    setSearch,
    sort, setSort,
    loading, error,
    // selectedProducts now comes straight from the hook - it's the
    // hook's own durable memory of what's selected, not something we
    // derive here from `products` (that derivation was the bug).
    selectedProducts, selectedIds, toggleSelect, removeFromSelection, clearSelection,
    create, editPriceAndStock, changeStatus, remove,
    bulkChangeStatus, bulkEditPriceAndStock, bulkRemove,
  } = useProducts();

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  // Clearing the × button doesn't wait for the 400ms debounce - it
  // updates both the visible input AND the real search value right
  // away, so hitting clear feels instant rather than laggy.
  function handleClearSearch() {
    setSearchInput("");
    setSearch("");
  }

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [sortField, sortDirection] = sort
    ? (sort.split(",") as [string, "asc" | "desc"])
    : [null, null];

  let columnCount = 7;
  if (canEdit && tab === "active") columnCount++;
  if (canEdit) columnCount++;
  if (tab === "active") columnCount++;

  function handleSortClick(field: string) {
    if (sortField === field) {
      setSort(sortDirection === "asc" ? `${field},desc` : undefined);
    } else {
      setSort(`${field},asc`);
    }
  }

  function sortIndicator(field: string) {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? " ▲" : " ▼";
  }

  function handleToggleStatus(id: number) {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    changeStatus(id, product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto p-7">
        <div className="mb-5">
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage stock levels and product records across your organization.
          </p>
        </div>

        <div className="flex gap-6 border-b border-slate-800 mb-5">
          <button
            onClick={() => setTab("active")}
            className={`pb-3 text-sm ${tab === "active" ? "text-slate-100 border-b-2 border-amber-500 font-medium" : "text-slate-500"}`}
          >
            Active Products
          </button>
          {canSeeDeletedTab && (
            <button
              onClick={() => setTab("deleted")}
              className={`pb-3 text-sm ${tab === "deleted" ? "text-slate-100 border-b-2 border-amber-500 font-medium" : "text-slate-500"}`}
            >
              Deleted Products
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex gap-2 flex-1 min-w-[260px]">
            {/* `relative` on this wrapper is what lets the × button
                below use `absolute` positioning to sit INSIDE the
                input's right edge, rather than as a separate element
                next to it. pr-8 on the input reserves that space so
                typed text never runs underneath the button. */}
            <div className="relative flex-1 max-w-xs">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name or SKU..."
                disabled={tab === "deleted"}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 pr-8 text-sm disabled:opacity-40"
              />
              {/* Only rendered at all once there's something to clear -
                  this is a plain && short-circuit: if searchInput is an
                  empty string (falsy), React renders nothing here. */}
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 text-sm leading-none"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {tab === "active" && canEdit && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-4 py-2 rounded-lg"
            >
              + Create Product
            </button>
          )}
          {!canEdit && (
            <span className="text-xs font-mono text-slate-500 border border-dashed border-slate-700 rounded-lg px-3 py-2">
              READ-ONLY ACCESS
            </span>
          )}
        </div>

        {error && <ErrorBanner title={error.title} detail={error.detail} />}

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-800">
                  {canEdit && tab === "active" && <th className="px-4 py-3 w-10"></th>}
                  <th className="px-4 py-3">{canEdit ? "ID" : "#"}</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">SKU</th>
                  <th
                    className="px-4 py-3 cursor-pointer select-none hover:text-slate-300"
                    onClick={() => handleSortClick("price")}
                  >
                    Price{sortIndicator("price")}
                  </th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  {canEdit && (
                    <th
                      className="px-4 py-3 cursor-pointer select-none hover:text-slate-300"
                      onClick={() => handleSortClick("createdAt")}
                    >
                      Created{sortIndicator("createdAt")}
                    </th>
                  )}
                  <th className="px-4 py-3">Updated</th>
                  {tab === "active" && <th className="px-4 py-3 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={columnCount} className="text-center py-10 text-slate-500">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      displayIndex={page * 10 + index + 1}
                      canEdit={canEdit && tab === "active"}
                      isSelected={selectedIds.has(product.id)}
                      onToggleSelect={toggleSelect}
                      onSavePriceAndStock={(id, price, stockQuantity) =>
                        editPriceAndStock(id, { price, stockQuantity })
                      }
                      onToggleStatus={handleToggleStatus}
                      onDelete={remove}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
          <span>
            Showing page {page + 1} of {Math.max(totalPages, 1)} ({totalElements} total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-8 h-8 border border-slate-700 rounded disabled:opacity-30"
            >
              ‹
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="w-8 h-8 border border-slate-700 rounded disabled:opacity-30"
            >
              ›
            </button>
          </div>
        </div>

        {tab === "active" && canEdit && (
          <SelectedPanel
            products={selectedProducts}
            onRemoveFromSelection={removeFromSelection}
            onClearAll={clearSelection}
            onSaveOne={(id, price, stockQuantity) => editPriceAndStock(id, { price, stockQuantity })}
            onBulkStatus={bulkChangeStatus}
            onBulkPriceAndStock={(price, stockQuantity) => bulkEditPriceAndStock({ price, stockQuantity })}
            onBulkDelete={bulkRemove}
          />
        )}
      </div>

      <CreateProductPanel isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreate={create} />
    </div>
  );
}