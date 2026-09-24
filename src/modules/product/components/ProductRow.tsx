import { useState } from "react";
import type { Product } from "../types/product.types";

interface ProductRowProps {
  product: Product;
  displayIndex: number;
  canEdit: boolean;
  isSelected: boolean;
  onToggleSelect: (product: Product) => void;
  onSavePriceAndStock: (id: number, price: number, stockQuantity: number) => void;
  onToggleStatus: (id: number) => void;
  onDelete: (id: number) => void;
}

export function ProductRow({
  product,
  displayIndex,
  canEdit,
  isSelected,
  onToggleSelect,
  onSavePriceAndStock,
  onToggleStatus,
  onDelete,
}: ProductRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftPrice, setDraftPrice] = useState(product.price.toString());
  const [draftStock, setDraftStock] = useState(product.stockQuantity.toString());

  const isLowStock = product.stockQuantity < 20;

  function startEdit() {
    setDraftPrice(product.price.toString());
    setDraftStock(product.stockQuantity.toString());
    setIsEditing(true);
  }

  function handleSave() {
    const parsedPrice = parseFloat(draftPrice);
    const parsedStock = parseInt(draftStock, 10);
    onSavePriceAndStock(product.id, parsedPrice, parsedStock);
    setIsEditing(false);
  }

  return (
    <tr className={isSelected ? "bg-amber-500/5" : ""}>
      {canEdit && (
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={isSelected}
            // Now passes the full product object, not just its id -
            // this is what lets the hook remember what was selected,
            // even after this row disappears from view (e.g. because
            // of a search).
            onChange={() => onToggleSelect(product)}
            className="accent-amber-500"
          />
        </td>
      )}

      <td className="px-4 py-3 text-slate-400">{canEdit ? product.id : displayIndex}</td>
      <td className="px-4 py-3 font-medium text-slate-100">{product.name}</td>
      <td className="px-4 py-3 font-mono text-xs text-slate-400">{product.sku}</td>

      <td className="px-4 py-3">
        {isEditing ? (
          <input
            value={draftPrice}
            onChange={(e) => setDraftPrice(e.target.value)}
            className="w-20 bg-slate-800 border border-blue-400 rounded px-2 py-1 text-sm font-mono"
          />
        ) : (
          <span className="font-mono">${product.price.toFixed(2)}</span>
        )}
      </td>

      <td className={`px-4 py-3 ${isLowStock && !isEditing ? "text-red-400 font-semibold" : ""}`}>
        {isEditing ? (
          <input
            value={draftStock}
            onChange={(e) => setDraftStock(e.target.value)}
            className="w-20 bg-slate-800 border border-blue-400 rounded px-2 py-1 text-sm font-mono"
          />
        ) : (
          product.stockQuantity
        )}
      </td>

      <td className="px-4 py-3">
        <StatusBadge status={product.status} />
      </td>

      {canEdit && (
        <td className="px-4 py-3 text-slate-500 text-xs">
          {new Date(product.createdAt).toLocaleDateString()}
        </td>
      )}

      <td className="px-4 py-3 text-slate-500 text-xs">
        {new Date(product.updatedAt).toLocaleDateString()}
      </td>

      {/* Everything below is centered now (was justify-end), and
          wrapped in one consistent flex container regardless of which
          branch renders - so "View only" and the icon groups all sit
          on the same horizontal line across every row, whatever the role. */}
      <td className="px-4 py-3">
        <div className="flex justify-center">
          {!canEdit ? (
            <span className="text-xs italic text-slate-500">View only</span>
          ) : isEditing ? (
            <div className="flex gap-1">
              <IconButton onClick={handleSave} color="success" title="Save">✓</IconButton>
              <IconButton onClick={() => setIsEditing(false)} color="danger" title="Cancel">✕</IconButton>
            </div>
          ) : (
            <div className="flex gap-1">
              <IconButton onClick={startEdit} color="info" title="Edit price/stock">✎</IconButton>
              <IconButton onClick={() => onToggleStatus(product.id)} color="warning" title="Toggle status">⇄</IconButton>
              <IconButton onClick={() => onDelete(product.id)} color="danger" title="Delete">✕</IconButton>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: Product["status"] }) {
  const styles = {
    ACTIVE: "bg-emerald-500/10 text-emerald-400",
    INACTIVE: "bg-slate-500/10 text-slate-400",
    DELETED: "bg-red-500/10 text-red-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function IconButton({
  onClick,
  color,
  title,
  children,
}: {
  onClick: () => void;
  color: "info" | "warning" | "danger" | "success";
  title: string;
  children: React.ReactNode;
}) {
  const colorClasses = {
    info: "hover:border-blue-400 hover:text-blue-400",
    warning: "hover:border-amber-400 hover:text-amber-400",
    danger: "hover:border-red-400 hover:text-red-400",
    success: "border-emerald-400 text-emerald-400",
  };
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 flex items-center justify-center border border-slate-700 rounded text-slate-400 text-sm ${colorClasses[color]}`}
    >
      {children}
    </button>
  );
}