'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Pin, CheckCircle2, XCircle, Trash2,
  Search, RefreshCw, Sparkles
} from "lucide-react";
import { getMemoryToken } from "../../../context/AuthContext";
import { getApiBase } from "../../../config/api";

export default function AdminCommunityNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'pending' | 'published' | 'rejected'
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [notification, setNotification] = useState(null);

  const getHeaders = () => {
    const token = getMemoryToken();
    return token ? { "x-access-token": token, Authorization: `Bearer ${token}` } : {};
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${getApiBase()}/dashboard/community-notes/admin/all`, {
        headers: getHeaders()
      });
      const data = res?.data?.results?.data || [];
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch community notes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAudit = async (id, status) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await axios.put(
        `${getApiBase()}/dashboard/community-notes/audit/${id}`,
        { status },
        { headers: getHeaders() }
      );
      setNotes((prev) =>
        prev.map((n) => (n._id === id ? { ...n, status } : n))
      );
      setNotification({
        type: "success",
        msg: `Note ${status === "published" ? "approved and published to landing page" : "marked as rejected"}.`
      });
    } catch (err) {
      console.error("Failed to audit note:", err);
      setNotification({
        type: "error",
        msg: "Failed to update note status. Please check permissions."
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this note?")) return;
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await axios.delete(`${getApiBase()}/dashboard/community-notes/${id}`, {
        headers: getHeaders()
      });
      setNotes((prev) => prev.filter((n) => n._id !== id));
      setNotification({
        type: "success",
        msg: "Note permanently deleted from bulletin database."
      });
    } catch (err) {
      console.error("Failed to delete note:", err);
      setNotification({
        type: "error",
        msg: "Failed to delete note."
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const pendingCount = notes.filter((n) => n.status === "pending").length;
  const publishedCount = notes.filter((n) => n.status === "published").length;
  const rejectedCount = notes.filter((n) => n.status === "rejected").length;

  const filtered = notes.filter((n) => {
    if (activeTab !== "all" && n.status !== activeTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchAuthor = (n.author || "").toLowerCase().includes(q);
      const matchTag = (n.tag || "").toLowerCase().includes(q);
      const matchNote = (n.note || "").toLowerCase().includes(q);
      const matchStudent = (n.student_name || "").toLowerCase().includes(q);
      return matchAuthor || matchTag || matchNote || matchStudent;
    }
    return true;
  });

  return (
    <div className="space-y-6 w-full max-w-6xl">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#33462C] dark:text-[#8FD4AE]">
            <Pin size={14} />
            <span>Community Moderation</span>
          </span>
          <h1 className="font-serif-lib text-2xl font-bold text-[#24341E] dark:text-[#8FD4AE] mt-1">
            Community Bulletin Board Audit
          </h1>
          <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6] mt-1 max-w-xl">
            Review student-submitted study notes, resolutions, and tips. Approved notes are published live to the public landing page.
          </p>
        </div>

        <button
          onClick={fetchNotes}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#DFE6DC] dark:border-[#26362D] bg-white dark:bg-[#1A261F] text-xs font-semibold text-[#24341E] dark:text-[#8FD4AE] hover:bg-[#EFF4EC] transition self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold border flex items-center justify-between ${
            notification.type === "success"
              ? "bg-[#EFF4EC] border-[#DFE6DC] text-[#24341E] dark:bg-[#1E2E25] dark:text-[#8FD4AE]"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:text-red-200"
          }`}
        >
          <span>{notification.msg}</span>
          <button onClick={() => setNotification(null)} className="underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* ── Filters & Tabs ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "all"
                ? "bg-[#33462C] text-white shadow-xs dark:bg-[#346F4F]"
                : "bg-white dark:bg-[#1A261F] text-[#0B0E0A] dark:text-[#A1B3A7] border border-[#DFE6DC] dark:border-[#26362D] hover:bg-[#EFF4EC]"
            }`}
          >
            All Submissions ({notes.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "pending"
                ? "bg-[#D97706] text-white shadow-xs"
                : "bg-white dark:bg-[#1A261F] text-[#0B0E0A] dark:text-[#A1B3A7] border border-[#DFE6DC] dark:border-[#26362D] hover:bg-[#EFF4EC]"
            }`}
          >
            <span>Pending Audit</span>
            {pendingCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("published")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "published"
                ? "bg-[#1E7448] text-white shadow-xs"
                : "bg-white dark:bg-[#1A261F] text-[#0B0E0A] dark:text-[#A1B3A7] border border-[#DFE6DC] dark:border-[#26362D] hover:bg-[#EFF4EC]"
            }`}
          >
            Published Live ({publishedCount})
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "rejected"
                ? "bg-[#A83232] text-white shadow-xs"
                : "bg-white dark:bg-[#1A261F] text-[#0B0E0A] dark:text-[#A1B3A7] border border-[#DFE6DC] dark:border-[#26362D] hover:bg-[#EFF4EC]"
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#33462C]/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search author, tag, or note..."
            className="w-full bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#0B0E0A] dark:text-white placeholder-[#33462C]/40 focus:outline-none focus:border-[#33462C]"
          />
        </div>
      </div>

      {/* ── Notes Grid / List ──────────────────────────────── */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#33462C] dark:text-[#8FD4AE] flex flex-col items-center justify-center gap-2">
          <RefreshCw size={24} className="animate-spin text-[#33462C] dark:text-[#8FD4AE]" />
          <span>Loading bulletin notes queue…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-12 text-center space-y-3">
          <Pin size={32} className="mx-auto text-[#33462C]/40 dark:text-[#8FD4AE]/40" />
          <h3 className="font-serif-lib text-lg font-bold text-[#24341E] dark:text-[#8FD4AE]">
            No Notes in this Category
          </h3>
          <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6] max-w-sm mx-auto">
            {activeTab === "pending"
              ? "All student study notes have been reviewed! There are no pending submissions awaiting audit."
              : "No notes match the current filter selection."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note) => {
            const isPending = note.status === "pending";
            const isPublished = note.status === "published";
            const isBusy = actionLoading[note._id];

            return (
              <div
                key={note._id}
                className="bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-5 shadow-xs flex flex-col justify-between relative transition hover:shadow-md"
              >
                <div>
                  {/* Status & Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold bg-[#EFF4EC] dark:bg-[#1E2E25] text-[#24341E] dark:text-[#8FD4AE] px-2.5 py-0.5 rounded-full border border-[#DFE6DC] dark:border-[#2C4133]">
                      {note.tag || "General Study"}
                    </span>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isPending
                          ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900"
                          : isPublished
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                          : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900"
                      }`}
                    >
                      {isPending ? "⏳ Pending Audit" : isPublished ? "✨ Published Live" : "Rejected"}
                    </span>
                  </div>

                  {/* Note Quote */}
                  <p className="font-serif-lib text-sm text-[#0B0E0A] dark:text-[#E8F1EC] italic leading-relaxed mb-4">
                    "{note.note}"
                  </p>
                </div>

                {/* Author Details & Audit Actions */}
                <div className="pt-3 border-t border-[#DFE6DC] dark:border-[#26362D] space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-[#0B0E0A] dark:text-[#9FB1A6]">
                    <div>
                      <span className="font-bold text-[#24341E] dark:text-white block">
                        - {note.author}
                      </span>
                      {note.student_name && note.student_name !== note.author && (
                        <span className="text-[10px] text-[#33462C]/70 dark:text-[#8FD4AE]/70 block">
                          Student: {note.student_name}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#0B0E0A]/60 dark:text-[#7A8C81]">
                      {note.cr_dt ? new Date(note.cr_dt).toLocaleDateString() : ""}
                    </span>
                  </div>

                  {/* Admin Audit Actions */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    {isPending ? (
                      <>
                        <button
                          disabled={isBusy}
                          onClick={() => handleAudit(note._id, "published")}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-[#33462C] hover:bg-[#24341E] dark:bg-[#2A4D3B] dark:hover:bg-[#37614B] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 size={13} />
                          <span>Publish to Landing</span>
                        </button>
                        <button
                          disabled={isBusy}
                          onClick={() => handleAudit(note._id, "rejected")}
                          className="py-1.5 px-2.5 rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                          title="Reject note"
                        >
                          <XCircle size={14} />
                        </button>
                      </>
                    ) : isPublished ? (
                      <>
                        <button
                          disabled={isBusy}
                          onClick={() => handleAudit(note._id, "rejected")}
                          className="flex-1 py-1.5 px-2.5 rounded-xl border border-[#DFE6DC] dark:border-[#26362D] hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                        >
                          Unpublish / Hide
                        </button>
                        <button
                          disabled={isBusy}
                          onClick={() => handleDelete(note._id)}
                          className="p-1.5 text-[#33462C]/40 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                          title="Delete note permanently"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          disabled={isBusy}
                          onClick={() => handleAudit(note._id, "published")}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-[#33462C] hover:bg-[#24341E] dark:bg-[#2A4D3B] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles size={13} />
                          <span>Approve &amp; Publish</span>
                        </button>
                        <button
                          disabled={isBusy}
                          onClick={() => handleDelete(note._id)}
                          className="p-1.5 text-[#33462C]/40 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                          title="Delete note permanently"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
