import { useState } from 'react';
import { PackagePlus, PencilLine, X } from 'lucide-react';
import Modal from './Modal.jsx';

const EMPTY = { name: '', sku: '', category: '', quantity: 0, price: 0, supplier: '', description: '' };
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export default function ItemForm({ item, categories = [], onSave, onCancel }) {
  const [form, setForm] = useState(item ? { ...EMPTY, ...item } : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => {
    const { name, value, type } = e.target;
    setForm({ ...form, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const total = (Number(form.quantity) || 0) * (Number(form.price) || 0);

  return (
    <Modal onClose={onCancel}>
      <form onSubmit={onSubmit}>
        <div className="modal-header">
          <div className="modal-icon">{item ? <PencilLine size={20} /> : <PackagePlus size={20} />}</div>
          <div>
            <h2>{item ? 'Edit item' : 'Add new item'}</h2>
            <p className="muted">{item ? `Update details for ${item.name}` : 'Fill in the product details below.'}</p>
          </div>
          <button type="button" className="icon-btn" onClick={onCancel} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert">{error}</div>}

          <div className="form-grid">
            <div className="field span-2">
              <label htmlFor="f-name">Product name *</label>
              <input id="f-name" name="name" value={form.name} onChange={onChange} placeholder="e.g. Wireless Mouse" required autoFocus />
            </div>
            <div className="field">
              <label htmlFor="f-sku">SKU *</label>
              <input id="f-sku" name="sku" className="mono" value={form.sku} onChange={onChange} placeholder="ELE-001" required />
            </div>
            <div className="field">
              <label htmlFor="f-category">Category</label>
              <input id="f-category" name="category" list="category-list" value={form.category} onChange={onChange} placeholder="General" />
              <datalist id="category-list">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="field">
              <label htmlFor="f-qty">Quantity *</label>
              <input id="f-qty" type="number" name="quantity" min="0" value={form.quantity} onChange={onChange} required />
            </div>
            <div className="field">
              <label htmlFor="f-price">Unit price *</label>
              <div className="input-prefix">
                <span>₹</span>
                <input id="f-price" type="number" name="price" min="0" step="0.01" value={form.price} onChange={onChange} required />
              </div>
            </div>
            <div className="field span-2">
              <label htmlFor="f-supplier">Supplier</label>
              <input id="f-supplier" name="supplier" value={form.supplier} onChange={onChange} placeholder="e.g. Logitech" />
            </div>
            <div className="field span-2">
              <label htmlFor="f-desc">Description</label>
              <textarea id="f-desc" name="description" rows="3" value={form.description} onChange={onChange} placeholder="Optional notes about this product" />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="total">
            <span className="muted">Stock value</span>
            <strong>{currency.format(total)}</strong>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn ghost" onClick={onCancel}>
              Cancel
            </button>
            <button className="btn primary" disabled={saving}>
              {saving ? <span className="spinner" /> : item ? 'Save changes' : 'Add item'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
