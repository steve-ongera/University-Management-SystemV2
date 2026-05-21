import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { news } from '../../api/api';
import { useFlash } from '../../components/FlashMessages';

const CATEGORY_BADGE = {
  academic:      'badge-primary',
  events:        'badge-success',
  announcements: 'badge-warning',
  sports:        'badge-info',
  general:       'badge-gray',
};

function NewsModal({ article, onClose, onSaved }) {
  const { flash } = useFlash();
  const isEdit = Boolean(article?.id);
  const [form, setForm] = useState({
    title:       article?.title       || '',
    content:     article?.content     || '',
    category:    article?.category    || 'general',
    is_published:article?.is_published ?? false,
    image:       null,
  });
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') setForm(f => ({ ...f, image: files[0] }));
    else if (type === 'checkbox') setForm(f => ({ ...f, [name]: checked }));
    else setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.image) delete payload.image;
      isEdit ? await news.update(article.id, payload) : await news.create(payload);
      flash(`Article ${isEdit ? 'updated' : 'published'}.`, 'success');
      onSaved();
    } catch { flash('Failed to save article.', 'danger'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box--lg">
        <div className="modal-box__header">
          <h5>{isEdit ? 'Edit Article' : 'New Article'}</h5>
          <button className="modal-close" onClick={onClose}><i className="ri-close-line" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-box__body">
            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label">Title *</label>
                <input className="form-control" name="title" value={form.title} onChange={handleChange} placeholder="Article title" required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Category</label>
                <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="events">Events</option>
                  <option value="announcements">Announcements</option>
                  <option value="sports">Sports</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Content *</label>
                <textarea className="form-control" name="content" value={form.content} onChange={handleChange} rows={8} placeholder="Write the article content…" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Cover Image</label>
                <input type="file" className="form-control" accept="image/*" onChange={handleChange} />
                {article?.image && <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>Current image: <a href={article.image} target="_blank" rel="noreferrer">view</a></div>}
              </div>
              <div className="col-md-6" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" name="is_published" checked={form.is_published} onChange={handleChange} />
                  <span style={{ fontSize: 13 }}>Publish immediately</span>
                </label>
              </div>
            </div>
          </div>
          <div className="modal-box__footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</> : isEdit ? 'Update Article' : 'Publish Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewsManagement() {
  const { flash } = useFlash();
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [search,   setSearch]   = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterPub, setFilterPub] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await news.list({ category: filterCat, published: filterPub });
      setArticles(res.data.results ?? res.data);
    } catch { flash('Failed to load articles.', 'danger'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filterCat, filterPub]);

  async function deleteArticle(id) {
    if (!window.confirm('Delete this article?')) return;
    try { await news.delete(id); flash('Deleted.', 'success'); load(); }
    catch { flash('Cannot delete.', 'danger'); }
  }

  const q = search.toLowerCase();
  const filtered = articles.filter(a => !q || a.title?.toLowerCase().includes(q) || a.category?.toLowerCase().includes(q));

  return (
    <div className="page-wrapper">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item active">News</li>
        </ol>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-header__title">News Management</h1>
          <p className="page-header__sub">Create and manage university news and announcements</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}>
            <i className="ri-add-line" /> New Article
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Articles', value: articles.length,                              color: 'primary', icon: 'ri-newspaper-line' },
          { label: 'Published',      value: articles.filter(a => a.is_published).length,  color: 'success', icon: 'ri-check-line' },
          { label: 'Draft',          value: articles.filter(a => !a.is_published).length, color: 'warning', icon: 'ri-draft-line' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-card__icon stat-card__icon--${s.color}`}><i className={s.icon} /></div>
            <div className="stat-card__body">
              <div className="stat-card__value">{s.value}</div>
              <div className="stat-card__label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h5><i className="ri-newspaper-line" /> Articles</h5>
          <div className="flex items-center gap-3 flex-wrap" style={{ marginLeft: 'auto' }}>
            <div className="search-bar">
              <i className="ri-search-line" />
              <input className="form-control" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 140 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">All Categories</option>
              <option value="general">General</option>
              <option value="academic">Academic</option>
              <option value="events">Events</option>
              <option value="announcements">Announcements</option>
              <option value="sports">Sports</option>
            </select>
            <select className="form-select" style={{ width: 120 }} value={filterPub} onChange={e => setFilterPub(e.target.value)}>
              <option value="">All</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-block"><span className="spinner" /> Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><i className="ri-newspaper-line" /><p>No articles found.</p></div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Author</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight: 500, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
                      </td>
                      <td><span className={`badge ${CATEGORY_BADGE[a.category] || 'badge-gray'}`}>{a.category}</span></td>
                      <td>{a.author_name || '—'}</td>
                      <td style={{ fontSize: 12 }}>{a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}</td>
                      <td style={{ fontSize: 12 }}>{a.updated_at ? new Date(a.updated_at).toLocaleDateString() : '—'}</td>
                      <td>
                        <span className={`badge ${a.is_published ? 'badge-success' : 'badge-warning'}`}>
                          {a.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1" style={{ justifyContent: 'flex-end' }}>
                          <button className="btn-icon" onClick={() => setModal(a)}><i className="ri-pencil-line" /></button>
                          <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => deleteArticle(a.id)}><i className="ri-delete-bin-line" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <NewsModal
          article={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}