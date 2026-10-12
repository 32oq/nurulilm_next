'use client';

import { useState, useEffect } from "react";
import { BookOpen, Search, Plus, Pencil, Trash2, X, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { useOther } from "../../../context/OtherContext";
import { LoadingRow, ErrorRow } from "../shared";

const CATEGORIES = ["all", "book", "magazine", "journal", "other"];

const AvailBadge = ({ n }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
    n > 0
      ? "bg-[#EDF3EE] dark:bg-[#1E2E25] text-[#1C3A2B] dark:text-[#8FD4AE] border-[#D9E2DC] dark:border-[#2B4032]"
      : "bg-[#FAF0F0] dark:bg-[#331818] text-[#A83232] dark:text-[#FCA5A5] border-[#F0D5D5] dark:border-[#542424]"
  }`}>
    {n > 0 ? (
      <>
        <CheckCircle2 size={11} />
        <span>{n} copies avail.</span>
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
    if (!window.confirm("Delete this resource from library catalog?")) return;
    const result = await removeResource(id);
    if (result) await fetchResources();
  };

  return (
    <div className="space-y-6 w-full max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#8CA093]">
            Archive &amp; Stacks
          </span>
          <h2 className="font-serif-lib text-2xl font-bold text-[#1C3A2B] dark:text-[#FAF8F5] mt-0.5">
            Library Catalog &amp; Books
          </h2>
          <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] mt-1">
            {isAdmin ? "Add, edit, or adjust inventory copies across library holdings." : "Search available reference texts, curriculum books, and reading materials."}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1C3A2B] hover:bg-[#142C20] dark:bg-[#2A4D3B] dark:hover:bg-[#37614B] text-white rounded-xl text-xs font-semibold transition self-start sm:self-auto shadow-xs cursor-pointer"
          >
            <Plus size={15} /> Add New Title
          </button>
        )}
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3">
        <div className="relative max-w-lg">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7F8781]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by book title or author..."
            className="w-full bg-white dark:bg-[#16211B] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1C1E1B] dark:text-white placeholder-[#8A928C] focus:border-[#1C3A2B] dark:focus:border-[#8FD4AE] focus:ring-1 focus:ring-[#1C3A2B] transition shadow-xs"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer ${
                category === cat
                  ? "bg-[#1C3A2B] text-white font-semibold dark:bg-[#2A4D3B]"
                  : "bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] text-[#5D645E] dark:text-[#9FB1A6] hover:bg-[#EDF3EE] dark:hover:bg-[#1F2C23] hover:text-[#1C3A2B]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading && <LoadingRow />}
      {error   && <ErrorRow />}

      {!loading && (
        filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl flex flex-col items-center justify-center py-16 px-6 gap-2 text-center shadow-xs">
            <BookOpen size={32} className="text-[#A2AAA3]" />
            <p className="font-serif-lib text-base font-bold text-[#1C3A2B] dark:text-[#FAF8F5]">
              {resources?.length === 0 ? "No resources in catalog yet" : "No titles matching your search"}
            </p>
            <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6]">
              Try adjusting your query or selecting a different category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(r => (
              <div
                key={r._id}
                className="bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl p-5 flex flex-col justify-between hover:border-[#1C3A2B]/40 hover:shadow-md transition-all duration-150 group shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-[#6D8374] dark:text-[#8CA093] bg-[#FAF8F5] dark:bg-[#203126] border border-[#E5DFD5] dark:border-[#2C4233] px-2 py-0.5 rounded-md capitalize">
                      {r.category || "book"}
                    </span>
                    <AvailBadge n={r.availability ?? 0} />
                  </div>

                  <h3 className="font-serif-lib text-base font-bold text-[#1C3A2B] dark:text-[#FAF8F5] leading-snug line-clamp-2 mt-1">
                    {r.title}
                  </h3>
                  {r.author && (
                    <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] mt-0.5">{r.author}</p>
                  )}
                  {r.isbn && (
                    <p className="text-[10px] text-[#7F8781] dark:text-[#8CA093] mt-0.5 font-mono">ISBN: {r.isbn}</p>
                  )}
                  {r.description && (
                    <p className="text-xs text-[#6F7770] dark:text-[#9FB1A6] line-clamp-2 mt-2 leading-relaxed">
                      {r.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#EFEBE4] dark:border-[#26362D]">
                  <span className="text-[11px] text-[#7F8781] dark:text-[#8CA093]">Handwara Stacks</span>
                  {isAdmin && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openEdit(r)}
                        className="p-1.5 rounded-lg bg-[#FAF8F5] dark:bg-[#203126] hover:bg-[#EDF3EE] text-[#5D645E] dark:text-[#C2D1C7] hover:text-[#1C3A2B] border border-[#E5DFD5] dark:border-[#2B4032] transition cursor-pointer"
                        title="Edit Resource"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="p-1.5 rounded-lg bg-[#FAF8F5] dark:bg-[#203126] hover:bg-[#FAF0F0] dark:hover:bg-[#3D1A1A] text-[#5D645E] hover:text-[#A83232] border border-[#E5DFD5] dark:border-[#2B4032] transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-[#1C1E1B]/60 flex items-center justify-center px-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#EFEBE4] dark:border-[#26362D] pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#8CA093]">Catalog Entry</span>
                <h3 className="font-serif-lib text-lg font-bold text-[#1C3A2B] dark:text-[#FAF8F5]">
                  {editing ? "Edit Book Details" : "Add New Book to Stacks"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-[#7F8781] hover:text-[#1C1E1B] dark:hover:text-white rounded-lg transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {[{ key: "title", label: "Title *" }, { key: "author", label: "Author" }, { key: "isbn", label: "ISBN / Catalog No." }].map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5]">{label}</label>
                <input
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] dark:focus:border-[#8FD4AE] focus:ring-1 focus:ring-[#1C3A2B] transition"
                />
              </div>
            ))}

            <div className="flex gap-3">
              <div className="space-y-1 flex-1">
                <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5]">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition"
                >
                  {["book", "magazine", "journal", "other"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 w-28">
                <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5]">Copies</label>
                <input
                  type="number"
                  min="0"
                  value={form.availability}
                  onChange={e => setForm(f => ({ ...f, availability: Number(e.target.value) }))}
                  className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5]">Description / Edition Notes</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition resize-none"
              />
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-[#A83232] bg-[#FAF0F0] dark:bg-[#331818] border border-[#F0D5D5] dark:border-[#542424] px-3 py-2 rounded-xl text-xs">
                <AlertTriangle size={14} /> {formError}
              </div>
            )}

            <button
              disabled={!form.title || saving}
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl bg-[#1C3A2B] hover:bg-[#142C20] dark:bg-[#2A4D3B] dark:hover:bg-[#37614B] disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              <span>{editing ? "Save Changes" : "Confirm & Add to Stacks"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
