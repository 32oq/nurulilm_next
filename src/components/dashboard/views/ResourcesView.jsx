'use client';

import { useState, useEffect } from "react";
import { BookOpen, Search, Plus, Pencil, Trash2, X, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { useOther } from "../../../context/OtherContext";
import { LoadingRow, ErrorRow } from "../shared";

const CATEGORIES = ["all", "book", "magazine", "journal", "other"];

const AvailBadge = ({ n }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold border ${
    n > 0
      ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
      : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
  }`}>
    {n > 0 ? (
      <>
        <CheckCircle2 size={11} />
        <span>{n} available</span>
      </>
    ) : (
      "Checked Out"
    )}
  </span>
);

export default function ResourcesView({ isAdmin }) {
  const { state: { resources, loading, error }, fetchResources, addResource, editResource, removeResource } = useOther();

  const [search,         setSearch]         = useState("");
  const [category,       setCategory]       = useState("all");
  const [showModal,      setShowModal]      = useState(false);
  const [editing,        setEditing]        = useState(null);
  const [form,           setForm]           = useState({ title: "", author: "", category: "book", description: "", isbn: "", availability: 1 });
  const [saving,         setSaving]         = useState(false);
  const [formError,      setFormError]      = useState(null);

  useEffect(() => { fetchResources(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const resList = Array.isArray(resources) ? resources : (Array.isArray(resources?.data) ? resources.data : []);
  const filtered = resList.filter(r => {
    const matchCat    = category === "all" || r?.category === category;
    const matchSearch = !search || r?.title?.toLowerCase().includes(search.toLowerCase()) || r?.author?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", author: "", category: "book", description: "", isbn: "", availability: 1 });
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    setForm({ title: r.title || "", author: r.author || "", category: r.category || "book", description: r.description || "", isbn: r.isbn || "", availability: r.availability ?? 1 });
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormError(null);
    const result = editing ? await editResource(editing._id, form) : await addResource(form);
    setSaving(false);
    if (result) { setShowModal(false); await fetchResources(); }
    else setFormError("Save failed. Check your connection or try again.");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resource from the library catalog?")) return;
    const result = await removeResource(id);
    if (result) await fetchResources();
  };

  return (
    <div className="space-y-6 w-full max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-lib text-2xl font-bold text-slate-900 dark:text-white">
            Library Catalog
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {isAdmin ? "Manage book catalog titles, inventory counts, and shelf classification." : "Browse available books, reference volumes, and periodicals in the library collection."}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#004B87] hover:bg-[#003B6B] text-white rounded-lg text-xs font-semibold transition self-start sm:self-auto shadow-xs cursor-pointer"
          >
            <Plus size={15} /> Add Book Title
          </button>
        )}
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3">
        <div className="relative max-w-lg">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, author, or keyword..."
            className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#004B87] focus:outline-none transition shadow-xs"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition cursor-pointer ${
                category === cat
                  ? "bg-[#004B87] text-white font-semibold"
                  : "bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </div>

      {loading && <LoadingRow />}
      {error   && <ErrorRow />}

      {!loading && (
        filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center py-16 px-6 gap-2 text-center shadow-xs">
            <BookOpen size={32} className="text-slate-400" />
            <p className="font-serif-lib text-base font-bold text-slate-900 dark:text-white">
              {resources?.length === 0 ? "No resources in catalog yet" : "No titles matching your search"}
            </p>
            <p className="text-xs text-slate-500">
              Try adjusting your query or selecting a different category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(r => (
              <div
                key={r._id}
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-400 dark:hover:border-slate-700 transition shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded capitalize">
                      {r.category || "book"}
                    </span>
                    <AvailBadge n={r.availability ?? 0} />
                  </div>

                  <h3 className="font-serif-lib text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 mt-1">
                    {r.title}
                  </h3>
                  {r.author && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{r.author}</p>
                  )}
                  {r.isbn && (
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">ISBN: {r.isbn}</p>
                  )}
                  {r.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                      {r.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500">Handwara Library</span>
                  {isAdmin && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openEdit(r)}
                        className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                        title="Edit Resource"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                        title="Delete Resource"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Add / Edit Resource Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-serif-lib text-lg font-bold text-slate-900 dark:text-white">
                  {editing ? "Edit Book Details" : "Add Book to Catalog"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {[{ key: "title", label: "Title *" }, { key: "author", label: "Author" }, { key: "isbn", label: "ISBN / Catalog Number" }].map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</label>
                <input
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition"
                />
              </div>
            ))}

            <div className="flex gap-3">
              <div className="space-y-1 flex-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition"
                >
                  {["book", "magazine", "journal", "other"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 w-28">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Copies</label>
                <input
                  type="number"
                  min="0"
                  value={form.availability}
                  onChange={e => setForm(f => ({ ...f, availability: Number(e.target.value) }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description / Edition Notes</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition resize-none"
              />
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-3 py-2 rounded-lg text-xs">
                <AlertTriangle size={14} /> {formError}
              </div>
            )}

            <button
              disabled={!form.title || saving}
              onClick={handleSave}
              className="w-full py-2.5 rounded-lg bg-[#004B87] hover:bg-[#003B6B] disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              <span>{editing ? "Save Changes" : "Confirm and Add to Catalog"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
