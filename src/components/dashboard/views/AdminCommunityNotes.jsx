'use client';

import { useState, useEffect } from "react";
import {
  Pin, CheckCircle2, XCircle, Trash2,
  Search, RefreshCw
} from "lucide-react";
import { communityService } from "../../../services/communityService";

export default function AdminCommunityNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [notification, setNotification] = useState(null);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await communityService.getAllNotes();
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
      await communityService.auditNote(id, status);
      setNotes((prev) =>
        prev.map((n) => (n._id === id ? { ...n, status } : n))
      );
      setNotification({
        type: "success",
        msg: `Note ${status === "published" ? "approved and published to noticeboard" : "marked as rejected"}.`
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
      await communityService.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      setNotification({
        type: "success",
        msg: "Note permanently deleted."
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
      {/* Header */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-lib text-2xl font-bold text-slate-900 dark:text-white">
            Community Noticeboard Moderation
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Review student-submitted study notes and tips. Approved notes are published to the public noticeboard.
          </p>
        </div>

        <button
          onClick={fetchNotes}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-lg text-xs font-semibold border flex items-center justify-between ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
          }`}
        >
          <span>{notification.msg}</span>
          <button onClick={() => setNotification(null)} className="underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Filters & Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "all"
                ? "bg-[#004B87] text-white shadow-xs"
                : "bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            All Submissions ({notes.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "pending"
                ? "bg-amber-700 text-white shadow-xs"
                : "bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <span>Pending Review</span>
            {pendingCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 text-[10px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("published")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "published"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "rejected"
                ? "bg-rose-700 text-white shadow-xs"
                : "bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search author, tag, or note..."
            className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#004B87]"
          />
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
          <RefreshCw size={24} className="animate-spin text-[#004B87]" />
          <span>Loading bulletin notes queue…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-3">
          <Pin size={32} className="mx-auto text-slate-400" />
          <h3 className="font-serif-lib text-lg font-bold text-slate-900 dark:text-white">
            No Notes in this Category
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === "pending"
              ? "All student study notes have been reviewed. There are no pending submissions awaiting audit."
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
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between relative transition hover:border-slate-400 dark:hover:border-slate-700"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {note.tag || "General Study"}
                    </span>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        isPending
                          ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900"
                          : isPublished
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                          : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
                      }`}
                    >
                      {isPending ? "Pending Review" : isPublished ? "Published" : "Rejected"}
                    </span>
                  </div>

                  <p className="font-serif-lib text-sm text-slate-900 dark:text-slate-100 italic leading-relaxed mb-4">
                    "{note.note}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        - {note.author}
                      </span>
                      {note.student_name && note.student_name !== note.author && (
                        <span className="text-[10px] text-slate-400 block">
                          Student: {note.student_name}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {note.cr_dt ? new Date(note.cr_dt).toLocaleDateString() : ""}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    {isPending ? (
                      <>
                        <button
                          disabled={isBusy}
                          onClick={() => handleAudit(note._id, "published")}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-[#004B87] hover:bg-[#003B6B] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 size={13} />
                          <span>Publish</span>
                        </button>
                        <button
                          disabled={isBusy}
                          onClick={() => handleAudit(note._id, "rejected")}
                          className="py-1.5 px-2.5 rounded-lg border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
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
                          className="flex-1 py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                        >
                          Unpublish
                        </button>
                        <button
                          disabled={isBusy}
                          onClick={() => handleDelete(note._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-700 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title="Delete note"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          disabled={isBusy}
                          onClick={() => handleAudit(note._id, "published")}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-[#004B87] hover:bg-[#003B6B] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                        >
                          <span>Publish</span>
                        </button>
                        <button
                          disabled={isBusy}
                          onClick={() => handleDelete(note._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-700 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title="Delete note"
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
