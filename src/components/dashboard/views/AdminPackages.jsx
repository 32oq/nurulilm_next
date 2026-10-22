'use client';

import { useState, useEffect } from 'react';
import {
  Layers, Plus, Edit2, Trash2, CheckCircle2, AlertCircle,
  Tag, Star, Calendar, CalendarRange, Award,
  BookOpen, Eye, EyeOff, Loader2, X, Percent, Check, Clock
} from 'lucide-react';
import { useOther } from '../../../context/OtherContext';
import { LoadingRow, ErrorRow } from '../shared';

const ICON_MAP = {
  Award,
  Calendar,
  CalendarRange,
  BookOpen,
  Star,
  Layers,
};

const DEFAULT_PACKAGE = {
  name: '',
  tagline: '',
  description: '',
  term_months: 1,
  timing: '',
  recurring_payment: 1200,
  registration_fee: 350,
  initial_payment: 1550,
  saving: 0,
  icon: 'Calendar',
  isPopular: 0,
  offer_text: '',
  offer_tag: '',
  discount_percent: 0,
  badge: '',
  is_active: true,
  features: [
    'Unlimited access to physical book collection',
    'Standard access to reading rooms',
    'Loan period: 14 days'
  ]
};

export default function AdminPackages() {
  const {
    state: { packages, libraryTimings, loading, error },
    getPackages, createPackage, updatePackage, deletePackage, fetchLibraryTimings
  } = useOther();

  const t = libraryTimings?.data || libraryTimings;
  const fullDaySchedule = t?.open_time && t?.close_time
    ? `Full Day (${t.open_time} – ${t.close_time})`
    : 'Full Day (Operating Hours)';

  const timingPresets = [
    { label: 'Full Day (Admin Hours)', value: fullDaySchedule, desc: (t?.open_time && t?.close_time) ? `${t.open_time} to ${t.close_time} (Admin Configured)` : 'Full access during center operating hours' },
  ];

  const resolveTiming = (t) => (!t || t === 'Full Day' || (typeof t === 'string' && t.includes('6:00 AM – 11:00 PM')))
    ? fullDaySchedule
    : t;

  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [form, setForm] = useState({ ...DEFAULT_PACKAGE, timing: fullDaySchedule });
  const [newFeatureText, setNewFeatureText] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    getPackages();
    if (fetchLibraryTimings) fetchLibraryTimings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const packageList = Array.isArray(packages) ? packages : [];

  const filteredPackages = packageList.filter(pkg => {
    const matchesSearch =
      (pkg.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (pkg.tagline || '').toLowerCase().includes(search.toLowerCase()) ||
      (pkg.timing || '').toLowerCase().includes(search.toLowerCase()) ||
      (pkg.offer_text || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTab === 'active') return pkg.is_active !== false;
    if (filterTab === 'offers') return Boolean(pkg.offer_text || pkg.discount_percent > 0 || pkg.offer_tag);
    return true;
  });

  const totalOffersCount = packageList.filter(p => p.offer_text || p.discount_percent > 0 || p.offer_tag).length;
  const activeCount = packageList.filter(p => p.is_active !== false).length;

  const handleOpenCreate = () => {
    setEditingPkg(null);
    setForm({ ...DEFAULT_PACKAGE, timing: fullDaySchedule });
    setFormError('');
    setFormSuccess('');
    setNewFeatureText('');
    setModalOpen(true);
  };

  const handleOpenEdit = (pkg) => {
    setEditingPkg(pkg);
    setForm({
      name: pkg.name || '',
      tagline: pkg.tagline || '',
      description: pkg.description || '',
      term_months: Number(pkg.term_months || 1),
      timing: resolveTiming(pkg.timing || pkg.timings),
      recurring_payment: Number(pkg.recurring_payment || 0),
      registration_fee: Number(pkg.registration_fee || 0),
      initial_payment: Number(pkg.initial_payment || 0),
      saving: Number(pkg.saving || 0),
      icon: pkg.icon || 'Calendar',
      isPopular: Number(pkg.isPopular || 0),
      offer_text: pkg.offer_text || '',
      offer_tag: pkg.offer_tag || '',
      discount_percent: Number(pkg.discount_percent || 0),
      badge: pkg.badge || '',
      is_active: pkg.is_active !== false,
      features: Array.isArray(pkg.features) ? [...pkg.features] : []
    });
    setFormError('');
    setFormSuccess('');
    setNewFeatureText('');
    setModalOpen(true);
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setForm(f => ({
      ...f,
      features: [...f.features, newFeatureText.trim()]
    }));
    setNewFeatureText('');
  };

  const handleRemoveFeature = (idx) => {
    setForm(f => ({
      ...f,
      features: f.features.filter((_, i) => i !== idx)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Plan name is required');
      return;
    }
    setSaving(true);
    setFormError('');
    setFormSuccess('');

    try {
      if (editingPkg) {
        await updatePackage(editingPkg._id, form);
        setFormSuccess('Package and timings updated successfully');
      } else {
        await createPackage(form);
        setFormSuccess('New package created successfully');
      }
      setTimeout(() => {
        setModalOpen(false);
      }, 700);
    } catch (err) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (pkg) => {
    try {
      const nextState = pkg.is_active === false ? true : false;
      await updatePackage(pkg._id, { is_active: nextState });
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (pkg) => {
    if (!window.confirm(`Are you sure you want to delete package "${pkg.name}"?`)) return;
    setDeletingId(pkg._id);
    try {
      await deletePackage(pkg._id);
    } catch (err) {
      alert(err.message || 'Failed to delete package');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-lib text-2xl font-bold text-slate-900 dark:text-white">
            Membership Plans &amp; Passes
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Configure reading room access tiers, library operating hours, fee structures, and promotional rates.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#004B87] hover:bg-[#003B6B] text-white text-xs font-semibold shadow-xs transition self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Plan</span>
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Total Plans</span>
          <p className="font-serif-lib text-2xl font-bold text-slate-900 dark:text-white mt-1">{packageList.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">configured tiers</p>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Active Tiers</span>
          <p className="font-serif-lib text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{activeCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">visible to students</p>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Special Offers</span>
          <p className="font-serif-lib text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">{totalOffersCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">active discounts</p>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Operating Hours</span>
          <p className="font-serif-lib text-2xl font-bold text-slate-900 dark:text-white mt-1">Configured</p>
          <p className="text-[11px] text-slate-500 mt-0.5">admin-scheduled</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'all', label: `All Plans (${packageList.length})` },
            { id: 'active', label: `Active (${activeCount})` },
            { id: 'offers', label: `Offers (${totalOffersCount})`, alert: totalOffersCount > 0 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === tab.id
                  ? 'bg-[#004B87] text-white shadow-xs'
                  : tab.alert
                    ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                    : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter by plan name, timing, or offer..."
          className="w-full sm:w-72 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#004B87] focus:outline-none transition shadow-xs"
        />
      </div>

      {loading && <LoadingRow />}
      {error && <ErrorRow />}

      {/* Package Cards Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPackages.map(pkg => {
            const IconComp = ICON_MAP[pkg.icon] || Calendar;
            const isOffer = Boolean(pkg.offer_text || pkg.discount_percent > 0 || pkg.offer_tag);
            const isActive = pkg.is_active !== false;

            return (
              <div
                key={pkg._id}
                className={`bg-white dark:bg-[#111827] rounded-xl border transition-all duration-150 flex flex-col justify-between overflow-hidden shadow-xs relative ${
                  isActive
                    ? 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                    : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50 dark:bg-slate-900'
                }`}
              >
                <div className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {pkg.isPopular ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Star size={10} className="fill-amber-600 text-amber-600" />
                          <span>Most Popular</span>
                        </span>
                      ) : null}

                      {isOffer && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <Tag size={10} />
                          <span>{pkg.offer_tag || pkg.offer_text || `${pkg.discount_percent}% OFF`}</span>
                        </span>
                      )}

                      {pkg.badge && !pkg.isPopular && !isOffer && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {pkg.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(pkg)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                        title="Edit package & timings"
                      >
                        <Edit2 size={10} />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleToggleActive(pkg)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition cursor-pointer ${
                          isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-800 dark:hover:text-rose-300'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-800 dark:hover:text-emerald-300'
                        }`}
                        title={isActive ? 'Click to hide plan' : 'Click to make active'}
                      >
                        {isActive ? <Eye size={11} /> : <EyeOff size={11} />}
                        <span>{isActive ? 'Active' : 'Hidden'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Header Title & Icon */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#004B87] dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                      <IconComp size={20} />
                    </div>
                    <div>
                      <h3 className="font-serif-lib text-lg font-bold text-slate-900 dark:text-white leading-tight">
                        {pkg.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {pkg.tagline || pkg.description}
                      </p>
                    </div>
                  </div>

                  {/* Term Duration & Shift Timing */}
                  <div className="mt-3.5 flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {pkg.term_months} Month{pkg.term_months > 1 ? 's' : ''} Term
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                      <Clock size={11} className="text-slate-500" />
                      <span>{resolveTiming(pkg.timing)}</span>
                    </span>
                  </div>

                  {/* Pricing Block */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-serif-lib text-2xl font-bold text-slate-900 dark:text-white">
                        ₹{Number(pkg.recurring_payment || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-500">/ {pkg.term_months === 1 ? 'month' : `${pkg.term_months} mos`}</span>

                      {pkg.saving > 0 && (
                        <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold ml-2">
                          Save ₹{pkg.saving}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Registration: ₹{pkg.registration_fee || 0}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">Initial Total: ₹{pkg.initial_payment || (pkg.recurring_payment + (pkg.registration_fee || 0))}</span>
                    </div>

                    {pkg.offer_text && (
                      <div className="mt-2.5 p-2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1.5">
                        <Percent size={12} className="text-amber-700 flex-shrink-0" />
                        <span>{pkg.offer_text}</span>
                      </div>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="mt-4 space-y-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                      Plan Inclusions
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      {(pkg.features || []).slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{f}</span>
                        </li>
                      ))}
                      {(pkg.features || []).length > 4 && (
                        <li className="text-[11px] text-slate-500 italic pl-5">
                          + {(pkg.features || []).length - 4} more benefits
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2.5">
                  <button
                    onClick={() => handleOpenEdit(pkg)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#004B87] hover:bg-[#003B6B] text-white shadow-xs transition cursor-pointer"
                  >
                    <Edit2 size={13} />
                    <span>Edit Plan</span>
                  </button>

                  <button
                    onClick={() => handleDelete(pkg)}
                    disabled={deletingId === pkg._id}
                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900 transition cursor-pointer disabled:opacity-50"
                    title="Delete package"
                  >
                    {deletingId === pkg._id ? (
                      <Loader2 size={15} className="animate-spin text-rose-600" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Package Creation & Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111827] rounded-xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-[#004B87] dark:text-slate-300 flex items-center justify-center">
                  {editingPkg ? <Edit2 size={18} /> : <Layers size={18} />}
                </div>
                <div>
                  <h3 className="font-serif-lib text-base font-bold text-slate-900 dark:text-white">
                    {editingPkg ? `Edit Plan: ${editingPkg.name}` : 'Create Subscription Plan'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Configure shift hours, pricing, and benefits
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 size={15} className="flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* 1. General Identity */}
              <div className="space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                  1. Plan Identity &amp; Term
                </span>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Plan Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Full Day Scholar Pass"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Duration (Months) *</label>
                    <input
                      type="number"
                      min="1"
                      max="36"
                      required
                      value={form.term_months}
                      onChange={e => setForm(f => ({ ...f, term_months: Number(e.target.value) }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Icon</label>
                    <select
                      value={form.icon}
                      onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition"
                    >
                      <option value="Calendar">Calendar (Monthly)</option>
                      <option value="CalendarRange">Calendar Range (Quarterly)</option>
                      <option value="Award">Award (Annual)</option>
                      <option value="BookOpen">Book Open (Scholarly)</option>
                      <option value="Star">Star (Popular)</option>
                      <option value="Layers">Layers (Multi-Tier)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tagline</label>
                  <input
                    value={form.tagline}
                    onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                    placeholder="e.g. Recommended for civil services preparation"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition"
                  />
                </div>
              </div>

              {/* 2. Reading Room Timings */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                  2. Shift Hours
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {timingPresets.map((preset) => {
                    const isSelected = form.timing === preset.value;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, timing: preset.value }))}
                        className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-slate-100 border-[#004B87] text-[#004B87] dark:bg-slate-800 dark:border-blue-400 dark:text-blue-300'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{preset.label}</span>
                          {isSelected && <Check size={12} className="text-[#004B87]" />}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">
                          {preset.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Shift Display Text *</label>
                  <input
                    required
                    value={form.timing}
                    onChange={e => setForm(f => ({ ...f, timing: e.target.value }))}
                    placeholder="e.g. Full Day (07:00 AM – 09:00 PM)"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition"
                  />
                </div>
              </div>

              {/* 3. Fee Structure */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                  3. Fee Structure
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Monthly Dues (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={form.recurring_payment}
                      onChange={e => setForm(f => ({ ...f, recurring_payment: Number(e.target.value) }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Admission Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.registration_fee}
                      onChange={e => setForm(f => ({ ...f, registration_fee: Number(e.target.value) }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Initial Total (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.initial_payment}
                      onChange={e => setForm(f => ({ ...f, initial_payment: Number(e.target.value) }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Promotional Offers */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                  4. Offers &amp; Badges
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Offer Tag</label>
                    <input
                      value={form.offer_tag}
                      onChange={e => setForm(f => ({ ...f, offer_tag: e.target.value }))}
                      placeholder="e.g. 15% OFF"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.discount_percent}
                      onChange={e => setForm(f => ({ ...f, discount_percent: Number(e.target.value) }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(form.isPopular)}
                      onChange={e => setForm(f => ({ ...f, isPopular: e.target.checked ? 1 : 0 }))}
                      className="w-4 h-4 text-[#004B87] rounded border-slate-300"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mark as Most Popular</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(form.is_active)}
                      onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                      className="w-4 h-4 text-[#004B87] rounded border-slate-300"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Active (Visible)</span>
                  </label>
                </div>
              </div>

              {/* 5. Plan Features */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                  5. Plan Features
                </span>

                <div className="space-y-2">
                  {form.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <Check size={12} />
                      </div>
                      <input
                        value={feat}
                        onChange={e => {
                          const val = e.target.value;
                          setForm(f => ({
                            ...f,
                            features: f.features.map((item, i) => i === idx ? val : item)
                          }));
                        }}
                        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-[#004B87] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition cursor-pointer"
                        title="Remove feature"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    value={newFeatureText}
                    onChange={e => setNewFeatureText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                    placeholder="Add an included amenity or feature..."
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#004B87]"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold bg-[#004B87] hover:bg-[#003B6B] text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>{editingPkg ? 'Update Plan' : 'Publish Plan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
