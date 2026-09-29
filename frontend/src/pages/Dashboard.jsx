import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  IndianRupee,
  Layers,
  LogOut,
  Package,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import api, { errorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import ItemForm from '../components/ItemForm.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { APP_NAME, LOW_STOCK } from '../config.js';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const number = new Intl.NumberFormat('en-IN');

const STATUSES = [
  { key: 'all', label: 'All' },
  { key: 'in', label: 'In stock' },
  { key: 'low', label: 'Low stock' },
  { key: 'out', label: 'Out of stock' },
];
const statusOf = (qty) => (qty === 0 ? 'out' : qty < LOW_STOCK ? 'low' : 'in');
const STATUS_LABEL = { in: 'In stock', low: 'Low stock', out: 'Out of stock' };

// Stable colour per category name
const hueClass = (s = '') => {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `hue-${h % 6}`;
};
const initials = (s = '') =>
  s
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, item = edit
  const [deleting, setDeleting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [itemsRes, statsRes] = await Promise.all([
        api.get('/items', { params: { search: search || undefined, category: category || undefined } }),
        api.get('/items/stats'),
      ]);
      setItems(itemsRes.data);
      setStats(statsRes.data);
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce search typing
    return () => clearTimeout(t);
  }, [load]);

  const counts = useMemo(() => {
    const c = { all: items.length, in: 0, low: 0, out: 0 };
    items.forEach((i) => c[statusOf(i.quantity)]++);
    return c;
  }, [items]);

  const visible = useMemo(
    () => (status === 'all' ? items : items.filter((i) => statusOf(i.quantity) === status)),
    [items, status]
  );

  const save = async (form) => {
    try {
      if (form._id) await api.put(`/items/${form._id}`, form);
      else await api.post('/items', form);
      toast(form._id ? `“${form.name}” updated` : `“${form.name}” added to inventory`);
      setEditing(null);
      load();
    } catch (err) {
      throw new Error(errorMessage(err));
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/items/${deleting._id}`);
      toast(`“${deleting.name}” deleted`);
      setDeleting(null);
      load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  const cards = stats && [
    { label: 'Total products', value: number.format(stats.totalItems), icon: Package, tone: 'indigo', hint: `${stats.categories.length} categories` },
    { label: 'Units in stock', value: number.format(stats.totalQuantity), icon: Layers, tone: 'sky', hint: 'Across all products' },
    { label: 'Inventory value', value: currency.format(stats.totalValue), icon: IndianRupee, tone: 'emerald', hint: 'Quantity × unit price' },
    { label: 'Low stock', value: number.format(stats.lowStock), icon: AlertTriangle, tone: 'amber', hint: `Below ${LOW_STOCK} units` },
  ];

  const hasFilters = search || category || status !== 'all';
  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setStatus('all');
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-mark">
              <Boxes size={20} />
            </div>
            <span>{APP_NAME}</span>
          </div>
          <div className="topbar-right">
            <ThemeToggle />
            <div className="user-chip">
              <div className="avatar">{initials(user.name)}</div>
              <div className="user-meta">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
            </div>
            <button className="icon-btn" onClick={logout} title="Log out" aria-label="Log out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <div>
            <p className="hero-date">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1>
              {greeting()}, {user.name.split(' ')[0]} 👋
            </h1>
            <p className="hero-sub">Here’s what’s happening with your inventory today.</p>
          </div>
          <button className="btn white lg" onClick={() => setEditing({})}>
            <Plus size={18} /> Add item
          </button>
        </div>
      </section>

      <main className="page">
        <section className="stats">
          {cards
            ? cards.map(({ label, value, icon: Icon, tone, hint }) => (
                <div key={label} className={`stat-card tone-${tone}`}>
                  <div className="stat-icon">
                    <Icon size={22} />
                  </div>
                  <div className="stat-body">
                    <span className="stat-label">{label}</span>
                    <strong className="stat-value">{value}</strong>
                    <span className="stat-hint">{hint}</span>
                  </div>
                </div>
              ))
            : Array.from({ length: 4 }, (_, i) => <div key={i} className="stat-card skeleton-card" />)}
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Inventory</h2>
              <p className="muted">
                {visible.length} {visible.length === 1 ? 'product' : 'products'}
                {hasFilters && ' matching filters'}
              </p>
            </div>
            <div className="toolbar">
              <div className="search">
                <Search size={18} />
                <input
                  placeholder="Search name, SKU or supplier…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button className="input-action" onClick={() => setSearch('')} aria-label="Clear search">
                    <X size={16} />
                  </button>
                )}
              </div>
              <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
                <option value="">All categories</option>
                {stats?.categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="chips">
            {STATUSES.map((s) => (
              <button
                key={s.key}
                className={`chip ${status === s.key ? 'active' : ''} chip-${s.key}`}
                onClick={() => setStatus(s.key)}
              >
                {s.label}
                <span className="chip-count">{counts[s.key]}</span>
              </button>
            ))}
          </div>

          {error && <div className="alert">{error}</div>}

          {loading ? (
            <div className="skeleton-table">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="skeleton-row" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">
                <PackageOpen size={36} />
              </div>
              <h3>{hasFilters ? 'No matching products' : 'Your inventory is empty'}</h3>
              <p className="muted">
                {hasFilters ? 'Try a different search or clear the filters.' : 'Add your first product to start tracking stock.'}
              </p>
              {hasFilters ? (
                <button className="btn ghost" onClick={clearFilters}>
                  Clear filters
                </button>
              ) : (
                <button className="btn primary" onClick={() => setEditing({})}>
                  <Plus size={18} /> Add item
                </button>
              )}
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Supplier</th>
                    <th>Status</th>
                    <th className="num">Qty</th>
                    <th className="num">Unit price</th>
                    <th className="num">Value</th>
                    <th className="num">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((item) => {
                    const st = statusOf(item.quantity);
                    return (
                      <tr key={item._id}>
                        <td>
                          <div className="product">
                            <div className={`product-avatar ${hueClass(item.category)}`}>{initials(item.name)}</div>
                            <div className="product-text">
                              <strong>{item.name}</strong>
                              {item.description && <span>{item.description}</span>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <code className="sku">{item.sku}</code>
                        </td>
                        <td>
                          <span className={`tag ${hueClass(item.category)}`}>{item.category}</span>
                        </td>
                        <td className="muted">{item.supplier || '—'}</td>
                        <td>
                          <span className={`status status-${st}`}>
                            <i />
                            {STATUS_LABEL[st]}
                          </span>
                        </td>
                        <td className="num strong">{number.format(item.quantity)}</td>
                        <td className="num">{currency.format(item.price)}</td>
                        <td className="num strong">{currency.format(item.price * item.quantity)}</td>
                        <td className="num">
                          <div className="row-actions">
                            <button className="icon-btn sm" onClick={() => setEditing(item)} title="Edit" aria-label={`Edit ${item.name}`}>
                              <Pencil size={16} />
                            </button>
                            <button className="icon-btn sm danger" onClick={() => setDeleting(item)} title="Delete" aria-label={`Delete ${item.name}`}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {editing && (
        <ItemForm
          item={editing._id ? editing : null}
          categories={stats?.categories}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this item?"
          message={`“${deleting.name}” (${deleting.sku}) will be permanently removed from your inventory.`}
          onConfirm={remove}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
