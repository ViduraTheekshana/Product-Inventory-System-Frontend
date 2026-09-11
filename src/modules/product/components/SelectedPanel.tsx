import { useState } from "react";
import type { Product, ProductStatus } from "../types/product.types";

interface SelectedPanelProps {
  products: Product[];
  onRemoveFromSelection: (id: number) => void;
  onClearAll: () => void;
  onSaveOne: (id: number, price: number, stockQuantity: number) => void;
  onBulkStatus: (status: ProductStatus) => void;
  onBulkPriceAndStock: (price?: number, stockQuantity?: number) => void;
  onBulkDelete: () => void;
}

export function SelectedPanel({
  products,
  onRemoveFromSelection,
  onClearAll,
  onSaveOne,
  onBulkStatus,
  onBulkPriceAndStock,
  onBulkDelete,
}: SelectedPanelProps) {
  const [openForm, setOpenForm] = useState<"none" | "price" | "status">("none");

  if (products.length === 0) {
    return null;
  }

  function toggleForm(form: "price" | "status") {
    // Selecting one form always closes the other - only one mini-form
    // makes sense open at a time, matching the mockup exactly.
    setOpenForm((current) => (current === form ? "none" : form));
  }

  return (
    <div className="mt-6 border border-amber-500 rounded-xl bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-700 flex-wrap">
        <p className="font-semibold text-slate-100">
          <span className="text-amber-400">{products.length}</span> products selected — review before applying
        </p>
        <div className="flex gap-2">
          <button onClick={() => toggleForm("price")} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-4 py-2 rounded-lg">
            Update All Price/Stock
          </button>
          <button onClick={() => toggleForm("status")} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-4 py-2 rounded-lg">
            Update All Status
          </button>
          <button onClick={onBulkDelete} className="bg-red-500/10 border border-red-400 text-red-400 hover:bg-red-500/20 font-semibold text-sm px-4 py-2 rounded-lg">
            Delete Selected
          </button>
          <button onClick={onClearAll} className="border border-slate-700 text-slate-400 hover:text-slate-100 text-sm px-4 py-2 rounded-lg">
            Clear all
          </button>
        </div>
      </div>

      {openForm === "price" && (
        <BulkPriceStockForm
          onApply={(price, stock) => {
            onBulkPriceAndStock(price, stock);
            setOpenForm("none");
          }}
          onCancel={() => setOpenForm("none")}
        />
      )}
      {openForm === "status" && (
        <BulkStatusForm
          onApply={(status) => {
            onBulkStatus(status);
            setOpenForm("none");
          }}
          onCancel={() => setOpenForm("none")}
        />
      )}

      <div>
        {products.map((product) => (
          <SelectedRow
            key={product.id}
            product={product}
            onRemove={() => onRemoveFromSelection(product.id)}
            onSave={onSaveOne}
          />
        ))}
      </div>
    </div>
  );
}

function BulkPriceStockForm({
  onApply,
  onCancel,
}: {
  onApply: (price?: number, stockQuantity?: number) => void;
  onCancel: () => void;
}) {
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  function handleApply() {
    // Empty fields stay undefined, not 0 - "leave price unchanged" is a
    // genuinely different intent from "set price to zero", and the
    // backend's BulkPriceStockUpdateRequest already expects exactly
    // this optional-field distinction.
    const parsedPrice = price.trim() === "" ? undefined : parseFloat(price);
    const parsedStock = stock.trim() === "" ? undefined : parseInt(stock, 10);
    onApply(parsedPrice, parsedStock);
  }

  return (
    <div className="flex items-center gap-3 px-5 py-3 bg-amber-500/5 border-b border-slate-700 flex-wrap">
      <label className="text-sm text-slate-400">Price</label>
      <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 29.99"
        className="w-28 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm" />
      <label className="text-sm text-slate-400">Stock</label>
      <input value={stock} onChange={(e) => setStock(e.target.value)} placeholder="e.g. 100"
        className="w-28 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm" />
      <button onClick={handleApply} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-4 py-1.5 rounded-lg">
        Apply to all selected
      </button>
      <button onClick={onCancel} className="border border-slate-700 text-slate-400 text-sm px-4 py-1.5 rounded-lg">
        Cancel
      </button>
    </div>
  );
}

function BulkStatusForm({
  onApply,
  onCancel,
}: {
  onApply: (status: ProductStatus) => void;
  onCancel: () => void;
}) {
  const [status, setStatus] = useState<ProductStatus>("ACTIVE");

  return (
    <div className="flex items-center gap-3 px-5 py-3 bg-amber-500/5 border-b border-slate-700 flex-wrap">
      <label className="text-sm text-slate-400">Status</label>
      <select value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)}
        className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm">
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
      </select>
      <button onClick={() => onApply(status)} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-4 py-1.5 rounded-lg">
        Apply to all selected
      </button>
      <button onClick={onCancel} className="border border-slate-700 text-slate-400 text-sm px-4 py-1.5 rounded-lg">
        Cancel
      </button>
    </div>
  );
}

function SelectedRow({
  product,
  onRemove,
  onSave,
}: {
  product: Product;
  onRemove: () => void;
  onSave: (id: number, price: number, stockQuantity: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftPrice, setDraftPrice] = useState(product.price.toString());
  const [draftStock, setDraftStock] = useState(product.stockQuantity.toString());

  function startEdit() {
    setDraftPrice(product.price.toString());
    setDraftStock(product.stockQuantity.toString());
    setIsEditing(true);
  }

  function handleSave() {
    onSave(product.id, parseFloat(draftPrice), parseInt(draftStock, 10));
    setIsEditing(false);
  }

  return (
    <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-800 last:border-b-0 text-sm">
      <span className="flex-[1.4] font-medium text-slate-100">{product.name}</span>
      <span className="flex-1 font-mono text-xs text-slate-400">{product.sku}</span>

      <span className="flex-[0.8]">
        {isEditing ? (
          <input value={draftPrice} onChange={(e) => setDraftPrice(e.target.value)}
            className="w-20 bg-slate-800 border border-blue-400 rounded px-2 py-1 text-sm font-mono" />
        ) : (
          <span className="font-mono">${product.price.toFixed(2)}</span>
        )}
      </span>

      <span className="flex-[0.8]">
        {isEditing ? (
          <input value={draftStock} onChange={(e) => setDraftStock(e.target.value)}
            className="w-20 bg-slate-800 border border-blue-400 rounded px-2 py-1 text-sm font-mono" />
        ) : (
          product.stockQuantity
        )}
      </span>

      <div className="flex gap-1">
        {isEditing ? (
          <>
            <ActionIcon onClick={handleSave} hoverColor="emerald">✓</ActionIcon>
            <ActionIcon onClick={() => setIsEditing(false)} hoverColor="red">✕</ActionIcon>
          </>
        ) : (
          <>
            <ActionIcon onClick={startEdit} hoverColor="blue" title="Edit this one">✎</ActionIcon>
            <ActionIcon onClick={onRemove} hoverColor="red" title="Remove from selection">✕</ActionIcon>
          </>
        )}
      </div>
    </div>
  );
}

function ActionIcon({
  onClick,
  hoverColor,
  title,
  children,
}: {
  onClick: () => void;
  hoverColor: "blue" | "red" | "emerald";
  title?: string;
  children: React.ReactNode;
}) {
  const colors = {
    blue: "hover:border-blue-400 hover:text-blue-400",
    red: "hover:border-red-400 hover:text-red-400",
    emerald: "border-emerald-400 text-emerald-400",
  };
  return (
    <button onClick={onClick} title={title}
      className={`w-7 h-7 flex items-center justify-center border border-slate-700 rounded text-slate-400 text-sm ${colors[hoverColor]}`}>
      {children}
    </button>
  );
}