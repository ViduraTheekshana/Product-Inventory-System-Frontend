import { useState } from "react";
import { Input } from "../../../common/components/Input";
import { Button } from "../../../common/components/Button";
import { ErrorBanner } from "../../../common/components/ErrorBanner";
import type { ApiError } from "../../../common/types/api.types";
import type { CreateProductRequest } from "../types/product.types";

interface CreateProductPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (request: CreateProductRequest) => Promise<void>;
}

export function CreateProductPanel({ isOpen, onClose, onCreate }: CreateProductPanelProps) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Resets every field back to empty - called after a successful create
  // AND on cancel, so the form never shows stale, half-filled values
  // the next time someone opens it.
  function resetForm() {
    setName("");
    setSku("");
    setPrice("");
    setStockQuantity("");
    setError(null);
  }

  function handleCancel() {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onCreate({
        name,
        sku,
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity, 10),
      });
      resetForm();
      onClose();
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-end z-50"
      onClick={(e) => {
        // Only close if the actual overlay backdrop was clicked, not
        // something inside the panel - clicking a form field shouldn't
        // dismiss the whole panel out from under someone mid-typing.
        if (e.target === e.currentTarget) handleCancel();
      }}
    >
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-700 p-7 overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Create Product</h2>
            <p className="text-sm text-slate-400 mt-1">Add a new product to the catalog.</p>
          </div>
          <button onClick={handleCancel} className="text-slate-500 hover:text-slate-300">✕</button>
        </div>

        {error && (
          <ErrorBanner title="Could not create product" detail={error.detail} onDismiss={() => setError(null)} />
        )}

        <form onSubmit={handleSubmit}>
          <Input id="name" label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wireless Mouse" />

          <Input id="sku" label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. WM-1001" />
          <p className="text-xs text-slate-500 -mt-3 mb-4">
            Must be unique. Cannot be reused once a product is deleted.
          </p>

          <Input id="price" label="Price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />

          <Input id="stockQuantity" label="Stock Quantity" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} placeholder="0" />
          <p className="text-xs text-slate-500 -mt-3 mb-4">
            Must be within the configured range (0–100,000).
          </p>

          <div className="flex gap-3 mt-6">
            <Button type="submit" loading={loading}>Save Product</Button>
            <button type="button" onClick={handleCancel}
              className="border border-slate-700 text-slate-400 hover:text-slate-100 px-5 rounded-lg text-sm">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}