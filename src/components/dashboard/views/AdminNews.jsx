'use client';

import { useState, useEffect } from "react";
import { Newspaper, Plus, Pin, PinOff, Pencil, Trash2, X, Loader2, AlertTriangle, Tag, Image, Calendar } from "lucide-react";
import moment from "moment";
import { useOther } from "../../../context/OtherContext";

const TAG_OPTIONS = ["Announcement", "Holiday", "Event", "Result", "Exam", "Schedule", "Other"];

const emptyForm = { title: "", body: "", image_url: "", tags: [], pinned: false };

export default function AdminNews() {
  const { fetchLibraryNews, createLibraryNews, updateLibraryNews, deleteLibraryNews } = useOther();

  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(emptyForm);
  const [saving,    setSaving]    = useState(false);
  const [formError, setFormError] = useState(null);

  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const data = await fetchLibraryNews();
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (post) => {
    setEditing(post);
    setForm({
      title:     post.title     || "",
      body:      post.body      || "",
      image_url: post.image_url || "",
      tags:      post.tags      || [],
      pinned:    post.pinned    || false,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setFormError("Title is required"); return; }
    if (!form.body.trim())  { setFormError("Body is required");  return; }
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await updateLibraryNews(editing._id, form);
      } else {
        await createLibraryNews(form);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setFormError(err.message || "Failed to save circular");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bulletin notice?")) return;
    setDeleting(id);
    try { await deleteLibraryNews(id); load(); } catch { /* ignore */ }
    setDeleting(null);
  };

  const handleTogglePin = async (post) => {
    try { await updateLibraryNews(post._id, { pinned: !post.pinned }); load(); } catch { /* ignore */ }
  };

  const toggleTag = (tag) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }));
  };

  return (
    <div className="space-y-6 w-full max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-serif-lib font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Newspaper size={22} className="text-[#004B87]" /> Notices &amp; Announcements
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Publish official circulars, holiday notices, schedules, and alerts for library members.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#004B87] hover:bg-[#003B6B] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus size={15} /> Issue New Notice
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-500 py-10 justify-center">
          <Loader2 size={18} className="animate-spin text-[#004B87]" />
          <span className="text-xs">Loading notices…</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-rose-800 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900 px-4 py-3 rounded-lg text-xs">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {!loading && posts.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-[#111827] text-center p-6">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
            <Newspaper size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">No notices published yet</p>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xs">Publish your first notice to inform members about desk schedules or exam materials.</p>
          </div>
          <button onClick={openCreate} className="text-xs font-semibold text-[#004B87] hover:underline transition cursor-pointer">Create first notice</button>
        </div>
      )}

      {/* Posts list */}
      <div className="space-y-3">
        {posts.map(post => (
          <div key={post._id} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs hover:border-slate-400 dark:hover:border-slate-700 transition">
            <div className="flex flex-col sm:flex-row gap-4 p-4">
              {post.image_url ? (
                <div className="w-full sm:w-28 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <img src={post.image_url} alt="" className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.parentElement.style.display = 'none'; }} />
                </div>
              ) : (
                <div className="w-full sm:w-28 h-24 rounded-lg flex-shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                  <Newspaper size={26} />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {post.pinned && (
                      <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                        <Pin size={9} /> Pinned
                      </span>
                    )}
                    {post.tags?.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-medium">{tag}</span>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400 flex-shrink-0 flex items-center gap-1">
                    <Calendar size={11} /> {moment(post.cr_dt).format("DD MMM YYYY")}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-1.5 line-clamp-1">{post.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{post.body}</p>
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500">Issued by: <strong className="text-slate-900 dark:text-white font-medium">{post.posted_by || "Administration"}</strong></span>
                  
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleTogglePin(post)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition border cursor-pointer ${
                        post.pinned 
                          ? 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 hover:bg-amber-100' 
                          : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                      }`}>
                      {post.pinned ? <PinOff size={11} /> : <Pin size={11} />}
                      {post.pinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button onClick={() => openEdit(post)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 hover:bg-slate-50 transition cursor-pointer">
                      <Pencil size={11} /> Edit
                    </button>
                    <button onClick={() => handleDelete(post._id)} disabled={deleting === post._id}
                      className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-rose-700 dark:text-rose-400 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-50 cursor-pointer">
                      {deleting === post._id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div>
                <h3 className="font-serif-lib font-bold text-sm text-slate-900 dark:text-white">{editing ? 'Edit Notice' : 'Draft New Notice'}</h3>
                <p className="text-[11px] text-slate-500">Published to the library board immediately.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"><X size={16} /></button>
            </div>

            <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Subject / Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Extended Library Hours for Upcoming Exams"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#004B87] placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Notice Content *</label>
                <textarea
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  placeholder="Write the full announcement text, instructions, and dates…"
                  rows={5}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#004B87] placeholder-slate-400 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5"><Image size={12} /> Image URL (optional)</label>
                <input
                  value={form.image_url}
                  onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#004B87] placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5"><Tag size={12} /> Category Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {TAG_OPTIONS.map(tag => (
                    <button key={tag} type="button" onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition border cursor-pointer ${
                        form.tags.includes(tag)
                          ? 'bg-[#004B87] border-[#004B87] text-white'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                      }`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.pinned}
                  onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#004B87] focus:ring-[#004B87] border-slate-300"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Pin size={12} className="text-amber-600" /> Pin notice to the top
                </span>
              </label>

              {formError && (
                <div className="flex items-center gap-2 text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900 px-3 py-2 rounded-lg text-xs">
                  <AlertTriangle size={13} /> {formError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <button onClick={() => setShowModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 transition cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#004B87] hover:bg-[#003B6B] text-white rounded-lg text-xs font-semibold transition disabled:opacity-50 shadow-xs cursor-pointer">
                {saving && <Loader2 size={13} className="animate-spin" />}
                {editing ? 'Save Changes' : 'Publish Notice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
