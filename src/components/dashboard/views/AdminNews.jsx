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
  const [editing,   setEditing]   = useState(null); // post object when editing
  const [form,      setForm]      = useState(emptyForm);
  const [saving,    setSaving]    = useState(false);
  const [formError, setFormError] = useState(null);

  const [deleting, setDeleting] = useState(null); // id being deleted

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DFD5] dark:border-[#26362D]">
        <div>
          <h2 className="text-xl font-serif-lib font-bold text-[#1C1E1B] dark:text-[#FAF8F5] flex items-center gap-2.5">
            <Newspaper size={22} className="text-[#1C3A2B] dark:text-[#8FD4AE]" /> Circulars &amp; Bulletin Board
          </h2>
          <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] mt-1">Publish official circulars, holiday notices, schedules, and alerts for library members.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1C3A2B] hover:bg-[#13221A] dark:bg-[#2A4D3B] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus size={15} /> Issue New Circular
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-[#5D645E] dark:text-[#9FB1A6] py-10 justify-center">
          <Loader2 size={18} className="animate-spin text-[#1C3A2B] dark:text-[#8FD4AE]" />
          <span className="text-xs">Loading circulars register…</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900 px-4 py-3 rounded-xl text-xs">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {!loading && posts.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 border border-dashed border-[#D9D2C5] dark:border-[#26362D] rounded-2xl bg-white dark:bg-[#16211B] text-center p-6">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] dark:bg-[#203126] border border-[#E5DFD5] dark:border-[#2B4032] flex items-center justify-center text-[#6D8374] dark:text-[#8FD4AE]">
            <Newspaper size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-[#1C1E1B] dark:text-white">No notices published yet</p>
            <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] mt-0.5 max-w-xs">Publish your first official notice to inform members about desk schedules or exam materials.</p>
          </div>
          <button onClick={openCreate} className="text-xs font-semibold text-[#1C3A2B] dark:text-[#8FD4AE] hover:underline transition cursor-pointer">Create first circular</button>
        </div>
      )}

      {/* Posts list */}
      <div className="space-y-3">
        {posts.map(post => (
          <div key={post._id} className="bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl overflow-hidden shadow-xs hover:border-[#1C3A2B]/40 transition">
            <div className="flex flex-col sm:flex-row gap-4 p-4">
              {/* Thumbnail */}
              {post.image_url ? (
                <div className="w-full sm:w-28 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-[#FAF8F5] dark:bg-[#111A14] border border-[#E5DFD5] dark:border-[#26362D]">
                  <img src={post.image_url} alt="" className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.parentElement.style.display = 'none'; }} />
                </div>
              ) : (
                <div className="w-full sm:w-28 h-24 rounded-xl flex-shrink-0 bg-[#FAF8F5] dark:bg-[#203126] border border-[#E5DFD5] dark:border-[#2B4032] flex items-center justify-center text-[#6D8374] dark:text-[#8FD4AE]">
                  <Newspaper size={26} />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {post.pinned && (
                      <span className="px-2 py-0.5 bg-[#FFFBEB] dark:bg-[#382B14] text-[#92400E] dark:text-[#FDE68A] border border-[#FDE68A] dark:border-[#574019] rounded-md text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                        <Pin size={9} /> Pinned Notice
                      </span>
                    )}
                    {post.tags?.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-[#F4EFE6] dark:bg-[#203126] text-[#2D312E] dark:text-[#8FD4AE] border border-[#E5DFD5] dark:border-[#2B4032] rounded-md text-[10px] font-medium">{tag}</span>
                    ))}
                  </div>
                  <span className="text-[11px] text-[#5D645E] dark:text-[#9FB1A6] flex-shrink-0 flex items-center gap-1">
                    <Calendar size={11} /> {moment(post.cr_dt).format("DD MMM YYYY")}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[#1C1E1B] dark:text-white mt-1.5 line-clamp-1">{post.title}</h3>
                <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] mt-1 line-clamp-2 leading-relaxed">{post.body}</p>
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#F4EFE6] dark:border-[#26362D]">
                  <span className="text-[11px] text-[#5D645E] dark:text-[#9FB1A6]">Issued by: <strong className="text-[#1C1E1B] dark:text-white font-medium">{post.posted_by || "Library Administration"}</strong></span>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleTogglePin(post)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition border cursor-pointer ${
                        post.pinned 
                          ? 'text-[#92400E] dark:text-[#FDE68A] bg-[#FFFBEB] dark:bg-[#382B14] border-[#FDE68A] dark:border-[#574019] hover:bg-[#FEF3C7]' 
                          : 'text-[#5D645E] dark:text-[#9FB1A6] bg-white dark:bg-[#16211B] border-[#E5DFD5] dark:border-[#26362D] hover:bg-[#FAF8F5]'
                      }`}>
                      {post.pinned ? <PinOff size={11} /> : <Pin size={11} />}
                      {post.pinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button onClick={() => openEdit(post)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-[#5D645E] dark:text-[#C2D1C7] bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] hover:bg-[#FAF8F5] transition cursor-pointer">
                      <Pencil size={11} /> Edit
                    </button>
                    <button onClick={() => handleDelete(post._id)} disabled={deleting === post._id}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-red-700 dark:text-red-300 bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] hover:bg-red-50 dark:hover:bg-red-950/40 transition disabled:opacity-50 cursor-pointer">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1E1B]/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#16211B] border border-[#D9D2C5] dark:border-[#26362D] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5DFD5] dark:border-[#26362D] bg-[#FAF8F5] dark:bg-[#1E2E25]">
              <div>
                <h3 className="font-serif-lib font-bold text-sm text-[#1C1E1B] dark:text-[#FAF8F5]">{editing ? 'Edit Circular Notice' : 'Draft New Notice'}</h3>
                <p className="text-[11px] text-[#5D645E] dark:text-[#9FB1A6]">Will be published immediately on the student bulletin and public board.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-[#5D645E] hover:text-[#1C1E1B] dark:hover:text-white transition cursor-pointer"><X size={16} /></button>
            </div>

            <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-[#1C1E1B] dark:text-[#FAF8F5] mb-1">Subject / Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Extended Library Hours for JKPSC Prelims Examination"
                  className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D2C5] dark:border-[#26362D] rounded-xl px-3.5 py-2 text-xs text-[#1C1E1B] dark:text-white focus:outline-none focus:border-[#1C3A2B] placeholder-[#9CA3AF]"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-medium text-[#1C1E1B] dark:text-[#FAF8F5] mb-1">Notice Content *</label>
                <textarea
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  placeholder="Write the full announcement text, instructions, and relevant dates…"
                  rows={5}
                  className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D2C5] dark:border-[#26362D] rounded-xl px-3.5 py-2 text-xs text-[#1C1E1B] dark:text-white focus:outline-none focus:border-[#1C3A2B] placeholder-[#9CA3AF] resize-none leading-relaxed"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-medium text-[#1C1E1B] dark:text-[#FAF8F5] mb-1 flex items-center gap-1.5"><Image size={12} /> Image / Document URL (optional)</label>
                <input
                  value={form.image_url}
                  onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D2C5] dark:border-[#26362D] rounded-xl px-3.5 py-2 text-xs text-[#1C1E1B] dark:text-white focus:outline-none focus:border-[#1C3A2B] placeholder-[#9CA3AF]"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium text-[#1C1E1B] dark:text-[#FAF8F5] mb-1.5 flex items-center gap-1.5"><Tag size={12} /> Category Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {TAG_OPTIONS.map(tag => (
                    <button key={tag} type="button" onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-medium transition border cursor-pointer ${
                        form.tags.includes(tag)
                          ? 'bg-[#1C3A2B] border-[#1C3A2B] text-white'
                          : 'bg-[#FAF8F5] dark:bg-[#111A14] border-[#E5DFD5] dark:border-[#26362D] text-[#5D645E] dark:text-[#9FB1A6] hover:border-[#1C3A2B]'
                      }`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pin */}
              <label className="flex items-center gap-3 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.pinned}
                  onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#1C3A2B] focus:ring-[#1C3A2B] border-[#D9D2C5]"
                />
                <span className="text-xs text-[#1C1E1B] dark:text-[#FAF8F5] flex items-center gap-1.5">
                  <Pin size={12} className="text-[#92400E] dark:text-[#FDE68A]" /> Pin notice to the top of member circulars
                </span>
              </label>

              {formError && (
                <div className="flex items-center gap-2 text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900 px-3 py-2 rounded-xl text-xs">
                  <AlertTriangle size={13} /> {formError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#E5DFD5] dark:border-[#26362D] bg-[#FAF8F5] dark:bg-[#1E2E25]">
              <button onClick={() => setShowModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-[#5D645E] dark:text-[#9FB1A6] hover:text-[#1C1E1B] transition cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#1C3A2B] hover:bg-[#13221A] dark:bg-[#2A4D3B] text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 shadow-xs cursor-pointer">
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
