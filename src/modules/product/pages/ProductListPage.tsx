import { useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { useProducts } from "../hooks/useProducts";
import { ProductRow } from "../components/ProductRow";
import { SelectedPanel } from "../components/SelectedPanel";
import { CreateProductPanel } from "../components/CreateProductPanel";
import { LoadingSpinner } from "../../../common/components/LoadingSpinner";
import { ErrorBanner } from "../../../common/components/ErrorBanner";

export function ProductListPage() {
  const { role } = useAuth();
  const canEdit = role === "MANAGER" || role === "ADMIN";
  const canSeeDeletedTab = canEdit;

  const {
    tab, setTab,
    products, page, setPage, totalPages, totalElements,
    search, setSearch,
    sort, setSort,
    loading, error,
    selectedIds, toggleSelect, clearSelection,
    create, editPriceAndStock, changeStatus, remove,
    bulkChangeStatus, bulkEditPriceAndStock, bulkRemove,
  } = useProducts();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const selectedProducts = products.filter((p) => selectedIds.has(p.id));

  // Only "price" and "createdAt" are valid sort fields on the backend
  // (see ProductSortValidator) - parsing the current sort string here,
  // once, lets both header cells check "am I the active sort column"
  // without duplicating that logic twice.
  const [sortField, sortDirection] = sort
    ? (sort.split(",") as [string, "asc" | "desc"])
    : [null, null];

  function handleSortClick(field: string) {
    if (sortField === field) {
      // Same column clicked again: flip direction, then clear entirely
      // on a third click - asc -> desc -> unsorted -> asc...
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
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or SKU..."
              disabled={tab === "deleted"}
              className="flex-1 max-w-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm disabled:opacity-40"
            />
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
                  {tab === "active" && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-slate-500">
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
            onRemoveFromSelection={toggleSelect}
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