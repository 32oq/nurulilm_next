'use client';

import { useState, useEffect } from 'react';
import {
  Layers, Plus, Edit2, Trash2, CheckCircle2, AlertCircle,
  Tag, Sparkles, Star, Calendar, CalendarRange, Award,
  BookOpen, Eye, EyeOff, Loader2, X, Percent, Check, Clock
} from 'lucide-react';
import { useOther } from '../../../context/OtherContext';
import { LoadingRow, ErrorRow } from '../shared';

const ICON_MAP = {
  Award,
  Calendar,
  CalendarRange,
  BookOpen,
  Sparkles,
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

  const fullDaySchedule = libraryTimings?.open_time && libraryTimings?.close_time
    ? `Full Day (${libraryTimings.open_time} – ${libraryTimings.close_time})`
    : 'Full Day (07:00 AM – 09:00 PM)';

  const timingPresets = [
    { label: 'Full Day (Library Hours)', value: fullDaySchedule, desc: `${libraryTimings?.open_time || '7 AM'} to ${libraryTimings?.close_time || '9 PM'} full access` },
    { label: 'Morning Shift', value: `Morning Shift (${libraryTimings?.open_time || '6:00 AM'} – 2:00 PM)`, desc: 'Morning study slot' },
    { label: 'Evening Shift', value: `Evening Shift (2:00 PM – ${libraryTimings?.close_time || '10:00 PM'})`, desc: 'Evening study slot' },
    { label: 'Night Shift', value: 'Night Shift (6:00 PM – 2:00 AM)', desc: 'Night study slot' },
    { label: '24x7 Round Clock', value: '24x7 Round the Clock Access', desc: 'Unrestricted 24 hours' },
  ];

  const resolveTiming = (t) => (!t || t === 'Full Day' || (typeof t === 'string' && t.includes('6:00 AM – 11:00 PM')))
    ? fullDaySchedule
    : t;

  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'active', 'offers'
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
        setFormSuccess('Package & timings updated successfully');
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
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#8CA093]">
            Membership Product Catalog
          </span>
          <h2 className="font-serif-lib text-2xl font-bold text-[#1C3A2B] dark:text-[#FAF8F5] mt-0.5">
            Reading Room Packages, Shifts &amp; Offers
          </h2>
          <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] mt-1">
            Configure student subscription tiers, reading room shifts &amp; timings, fees, and promotional discounts.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C3A2B] hover:bg-[#142C20] dark:bg-[#2A4D3B] dark:hover:bg-[#37614B] text-white text-xs font-semibold shadow-xs transition self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Package</span>
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#8CA093] block">Total Packages</span>
          <p className="font-serif-lib text-2xl font-bold text-[#1C1E1B] dark:text-white mt-1">{packageList.length}</p>
          <p className="text-[11px] text-[#7F8781] dark:text-[#9FB1A6] mt-0.5">configured plans</p>
        </div>
        <div className="bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#8CA093] block">Active Tiers</span>
          <p className="font-serif-lib text-2xl font-bold text-[#2E6B3F] dark:text-[#8FD4AE] mt-1">{activeCount}</p>
          <p className="text-[11px] text-[#7F8781] dark:text-[#9FB1A6] mt-0.5">available to students</p>
        </div>
        <div className="bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#8CA093] block">Special Offers</span>
          <p className="font-serif-lib text-2xl font-bold text-[#D97706] dark:text-[#FDE68A] mt-1">{totalOffersCount}</p>
          <p className="text-[11px] text-[#7F8781] dark:text-[#9FB1A6] mt-0.5">discounts live</p>
        </div>
        <div className="bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#8CA093] block">Shift Timings</span>
          <p className="font-serif-lib text-2xl font-bold text-[#1C3A2B] dark:text-[#8FD4AE] mt-1">Configured</p>
          <p className="text-[11px] text-[#7F8781] dark:text-[#9FB1A6] mt-0.5">hours per pass</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'all', label: `All Plans (${packageList.length})` },
            { id: 'active', label: `Active Only (${activeCount})` },
            { id: 'offers', label: `Special Offers (${totalOffersCount})`, alert: totalOffersCount > 0 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === tab.id
                  ? 'bg-[#1C3A2B] text-white shadow-xs dark:bg-[#2A4D3B]'
                  : tab.alert
                    ? 'bg-[#FEF3C7] dark:bg-[#3B2C13] text-[#92400E] dark:text-[#FDE68A] border border-[#FDE68A] dark:border-[#574019] hover:bg-[#FDE68A]'
                    : 'bg-white dark:bg-[#16211B] text-[#5D645E] dark:text-[#9FB1A6] border border-[#E5DFD5] dark:border-[#26362D] hover:bg-[#FAF8F5]'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter by title, timing, or offer..."
          className="w-full sm:w-72 bg-white dark:bg-[#16211B] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3.5 py-2 text-xs text-[#1C1E1B] dark:text-white placeholder-[#8A928C] focus:border-[#1C3A2B] transition shadow-xs"
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
                className={`bg-white dark:bg-[#16211B] rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs relative ${
                  isActive
                    ? 'border-[#E5DFD5] dark:border-[#26362D] hover:border-[#1C3A2B] hover:shadow-md'
                    : 'border-[#E5DFD5] dark:border-[#26362D] opacity-75 bg-[#FAF8F5] dark:bg-[#111A14]'
                }`}
              >
                {/* Top Badge Strip & Action Shortcuts */}
                <div className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {pkg.isPopular ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#FEF3C7] dark:bg-[#3B2C13] text-[#92400E] dark:text-[#FDE68A] border border-[#FDE68A] dark:border-[#574019]">
                          <Star size={10} className="fill-[#D97706] text-[#D97706]" />
                          <span>Most Popular</span>
                        </span>
                      ) : null}

                      {isOffer && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#EDF3EE] dark:bg-[#1E2E25] text-[#1C3A2B] dark:text-[#8FD4AE] border border-[#C2D1C7] dark:border-[#2B4032]">
                          <Tag size={10} />
                          <span>{pkg.offer_tag || pkg.offer_text || `${pkg.discount_percent}% OFF`}</span>
                        </span>
                      )}

                      {pkg.badge && !pkg.isPopular && !isOffer && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#FAF8F5] dark:bg-[#203126] text-[#5D645E] dark:text-[#8CA093] border border-[#E5DFD5] dark:border-[#2B4032]">
                          {pkg.badge}
                        </span>
                      )}
                    </div>

                    {/* Quick Action Top Bar (Edit & Toggle) */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(pkg)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FAF8F5] dark:bg-[#203126] text-[#1C3A2B] dark:text-[#8FD4AE] border border-[#D9D3C7] dark:border-[#2B4032] hover:bg-[#EDF3EE] transition cursor-pointer"
                        title="Edit package & timings"
                      >
                        <Edit2 size={10} />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleToggleActive(pkg)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border transition cursor-pointer ${
                          isActive
                            ? 'bg-[#EDF3EE] dark:bg-[#1E2E25] text-[#2E6B3F] dark:text-[#8FD4AE] border-[#D9E2DC] dark:border-[#2B4032] hover:bg-[#FAF0F0] hover:text-[#A83232]'
                            : 'bg-[#FAF0F0] dark:bg-[#3D1A1A] text-[#A83232] dark:text-[#FCA5A5] border-[#F0D5D5] dark:border-[#5C2A2A] hover:bg-[#EDF3EE] hover:text-[#2E6B3F]'
                        }`}
                        title={isActive ? 'Click to hide package' : 'Click to make active'}
                      >
                        {isActive ? <Eye size={11} /> : <EyeOff size={11} />}
                        <span>{isActive ? 'Active' : 'Hidden'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Header Title & Icon */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EDF3EE] dark:bg-[#203126] text-[#1C3A2B] dark:text-[#8FD4AE] flex items-center justify-center flex-shrink-0">
                      <IconComp size={20} />
                    </div>
                    <div>
                      <h3 className="font-serif-lib text-lg font-bold text-[#1C1E1B] dark:text-[#FAF8F5] leading-tight">
                        {pkg.name}
                      </h3>
                      <p className="text-xs text-[#6F7770] dark:text-[#9FB1A6] mt-0.5 line-clamp-2">
                        {pkg.tagline || pkg.description}
                      </p>
                    </div>
                  </div>

                  {/* Term Duration & Shift Timing Pills */}
                  <div className="mt-3.5 flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#1E2E25] text-[#424A44] dark:text-[#C2D1C7] border border-[#E5DFD5] dark:border-[#2C4133]">
                      {pkg.term_months} Month{pkg.term_months > 1 ? 's' : ''} Term
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#EDF3EE] dark:bg-[#1E2E25] text-[#1C3A2B] dark:text-[#8FD4AE] border border-[#C2D1C7] dark:border-[#2B4032] flex items-center gap-1.5">
                      <Clock size={11} className="text-[#1C3A2B] dark:text-[#8FD4AE]" />
                      <span>{resolveTiming(pkg.timing)}</span>
                    </span>
                  </div>

                  {/* Pricing Block */}
                  <div className="mt-4 pt-3.5 border-t border-[#EFEBE4] dark:border-[#26362D]">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-serif-lib text-2xl font-bold text-[#1C3A2B] dark:text-[#8FD4AE]">
                        ₹{Number(pkg.recurring_payment || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-[#7F8781] dark:text-[#9FB1A6]">/ {pkg.term_months === 1 ? 'month' : `${pkg.term_months} mos`}</span>

                      {pkg.saving > 0 && (
                        <span className="text-xs text-[#2E6B3F] dark:text-[#8FD4AE] font-semibold ml-2">
                          Save ₹{pkg.saving}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[11px] text-[#7F8781] dark:text-[#9FB1A6]">
                      <span>Registration: ₹{pkg.registration_fee || 0}</span>
                      <span className="font-medium text-[#1C1E1B] dark:text-white">Initial: ₹{pkg.initial_payment || (pkg.recurring_payment + (pkg.registration_fee || 0))}</span>
                    </div>

                    {pkg.offer_text && (
                      <div className="mt-2.5 p-2 rounded-xl bg-[#FFFBEB] dark:bg-[#382B14] border border-[#FDE68A] dark:border-[#574019] text-[11px] text-[#92400E] dark:text-[#FDE68A] font-medium flex items-center gap-1.5">
                        <Percent size={12} className="text-[#D97706] flex-shrink-0" />
                        <span>{pkg.offer_text}</span>
                      </div>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="mt-4 space-y-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#8CA093] block">
                      Plan Inclusions
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#424A44] dark:text-[#C2D1C7]">
                      {(pkg.features || []).slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 size={13} className="text-[#2E6B3F] dark:text-[#8FD4AE] flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{f}</span>
                        </li>
                      ))}
                      {(pkg.features || []).length > 4 && (
                        <li className="text-[11px] text-[#7F8781] dark:text-[#9FB1A6] italic pl-5">
                          + {(pkg.features || []).length - 4} more benefits
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-[#FAF8F5] dark:bg-[#1E2E25]/50 border-t border-[#EFEBE4] dark:border-[#26362D] flex items-center justify-between gap-2.5">
                  <button
                    onClick={() => handleOpenEdit(pkg)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#1C3A2B] hover:bg-[#142C20] dark:bg-[#2A4D3B] text-white shadow-xs transition cursor-pointer"
                  >
                    <Edit2 size={13} />
                    <span>Edit Plan &amp; Timings</span>
                  </button>

                  <button
                    onClick={() => handleDelete(pkg)}
                    disabled={deletingId === pkg._id}
                    className="p-2 rounded-xl text-[#A83232] dark:text-[#FCA5A5] hover:bg-[#FAF0F0] dark:hover:bg-[#3D1A1A] border border-[#F0D5D5] dark:border-[#5C2A2A] transition cursor-pointer disabled:opacity-50"
                    title="Delete package"
                  >
                    {deletingId === pkg._id ? (
                      <Loader2 size={15} className="animate-spin text-[#A83232]" />
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
        <div className="fixed inset-0 z-50 bg-[#1C1E1B]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#16211B] rounded-2xl max-w-xl w-full border border-[#E5DFD5] dark:border-[#26362D] shadow-xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFEBE4] dark:border-[#26362D] bg-[#FAF8F5] dark:bg-[#1E2E25]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EDF3EE] dark:bg-[#203126] text-[#1C3A2B] dark:text-[#8FD4AE] flex items-center justify-center">
                  {editingPkg ? <Edit2 size={18} /> : <Layers size={18} />}
                </div>
                <div>
                  <h3 className="font-serif-lib text-base font-bold text-[#1C3A2B] dark:text-[#FAF8F5]">
                    {editingPkg ? `Edit Package: ${editingPkg.name}` : 'Create New Subscription Package'}
                  </h3>
                  <p className="text-[11px] text-[#7F8781] dark:text-[#9FB1A6]">
                    {editingPkg
                      ? 'Update package timing hours, pricing rates, and promotional discounts'
                      : 'Configure plan specifications, reading room shifts, and promotional offers'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#7F8781] hover:bg-[#EFEBE4] dark:hover:bg-[#203126] transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {editingPkg && (
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] text-[#424A44] dark:text-[#C2D1C7] text-[11px] flex items-center justify-between">
                  <span>Currently editing: <strong className="text-[#1C3A2B] dark:text-[#8FD4AE]">{editingPkg.name}</strong></span>
                  <span className="font-semibold text-[#2E6B3F] dark:text-[#8FD4AE]">Real-time catalog sync</span>
                </div>
              )}

              {formError && (
                <div className="p-3 rounded-xl bg-[#FAF0F0] dark:bg-[#3D1A1A] border border-[#F0D5D5] dark:border-[#5C2A2A] text-[#A83232] dark:text-[#FCA5A5] text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 rounded-xl bg-[#EDF3EE] dark:bg-[#1E2E25] border border-[#D9E2DC] dark:border-[#2B4032] text-[#2E6B3F] dark:text-[#8FD4AE] text-xs flex items-center gap-2">
                  <CheckCircle2 size={15} className="flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* 1. General Identity & Term */}
              <div className="space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#8CA093] block">
                  1. Plan Identity &amp; Term Duration
                </span>

                <div>
                  <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5] block mb-1">Package Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Semi-Annual Dedicated Carrel"
                    className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3.5 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5] block mb-1">Duration (Months) *</label>
                    <input
                      type="number"
                      min="1"
                      max="36"
                      required
                      value={form.term_months}
                      onChange={e => setForm(f => ({ ...f, term_months: Number(e.target.value) }))}
                      className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3.5 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5] block mb-1">Display Icon</label>
                    <select
                      value={form.icon}
                      onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                      className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3.5 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition"
                    >
                      <option value="Calendar">Calendar (Monthly)</option>
                      <option value="CalendarRange">Calendar Range (Quarterly)</option>
                      <option value="Award">Award (Annual / Best Value)</option>
                      <option value="BookOpen">Book Open (Scholarly)</option>
                      <option value="Sparkles">Sparkles (Special / VIP)</option>
                      <option value="Star">Star (Popular)</option>
                      <option value="Layers">Layers (Multi-Tier)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5] block mb-1">Tagline / Short Pitch</label>
                  <input
                    value={form.tagline}
                    onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                    placeholder="e.g. Best choice for competitive civil service prep"
                    className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3.5 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5] block mb-1">Full Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Comprehensive overview of reading room privileges included..."
                    className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3.5 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition"
                  />
                </div>
              </div>

              {/* 2. Reading Room Timings & Shift Hours */}
              <div className="space-y-3 pt-3 border-t border-[#EFEBE4] dark:border-[#26362D]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#8CA093] block">
                    2. Reading Room Timing &amp; Shift Slot
                  </span>
                  <span className="text-[10px] text-[#7F8781] dark:text-[#9FB1A6]">Quick select shift or custom hours</span>
                </div>

                {/* Preset Shift Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {timingPresets.map((preset) => {
                    const isSelected = form.timing === preset.value;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, timing: preset.value }))}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#EDF3EE] dark:bg-[#203126] border-[#1C3A2B] dark:border-[#8FD4AE] text-[#1C3A2B] dark:text-[#8FD4AE] ring-1 ring-[#1C3A2B]'
                            : 'bg-[#FAF8F5] dark:bg-[#111A14] border-[#D9D3C7] dark:border-[#26362D] text-[#424A44] dark:text-[#C2D1C7] hover:border-[#1C3A2B]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold leading-tight">{preset.label}</span>
                          {isSelected && <Check size={12} className="text-[#1C3A2B] dark:text-[#8FD4AE]" />}
                        </div>
                        <span className="text-[10px] text-[#7F8781] dark:text-[#9FB1A6] mt-1">{preset.desc}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Timing Text Input */}
                <div>
                  <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5] block mb-1">
                    Timing Hours Displayed on Pass *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6D8374] dark:text-[#8CA093]">
                      <Clock size={14} />
                    </div>
                    <input
                      required
                      value={form.timing}
                      onChange={e => setForm(f => ({ ...f, timing: e.target.value }))}
                      placeholder={`e.g. ${fullDaySchedule}`}
                      className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition"
                    />
                  </div>
                  <p className="text-[10px] text-[#7F8781] dark:text-[#9FB1A6] mt-1">
                    This schedule is visible to students during enrollment and on their pass dashboard.
                  </p>
                </div>
              </div>

              {/* 3. Pricing & Financials */}
              <div className="space-y-3 pt-3 border-t border-[#EFEBE4] dark:border-[#26362D]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#8CA093] block">
                  3. Pricing &amp; Registration Dues (₹)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5] block mb-1">Term Fee (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.recurring_payment}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setForm(f => ({
                          ...f,
                          recurring_payment: val,
                          initial_payment: val + Number(f.registration_fee || 0)
                        }));
                      }}
                      className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3.5 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5] block mb-1">Registration (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.registration_fee}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setForm(f => ({
                          ...f,
                          registration_fee: val,
                          initial_payment: Number(f.recurring_payment || 0) + val
                        }));
                      }}
                      className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3.5 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5] block mb-1">Initial Checkout (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.initial_payment}
                      onChange={e => setForm(f => ({ ...f, initial_payment: Number(e.target.value) }))}
                      className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3.5 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5] block mb-1">Discount Savings (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.saving}
                    onChange={e => setForm(f => ({ ...f, saving: Number(e.target.value) }))}
                    placeholder="e.g. 1400 (displayed as strike-through savings)"
                    className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3.5 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition"
                  />
                </div>
              </div>

              {/* 4. Promotional Offers & Merchandising */}
              <div className="space-y-3 pt-3 border-t border-[#EFEBE4] dark:border-[#26362D]">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-[#D97706]" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#92400E] dark:text-[#FDE68A]">
                    4. Promotional Offers &amp; Badges
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5] block mb-1">Offer Tag / Banner</label>
                    <input
                      value={form.offer_tag}
                      onChange={e => setForm(f => ({ ...f, offer_tag: e.target.value }))}
                      placeholder="e.g. Ramadan Special 15% OFF"
                      className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3.5 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5] block mb-1">Discount Percentage (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.discount_percent}
                      onChange={e => setForm(f => ({ ...f, discount_percent: Number(e.target.value) }))}
                      placeholder="e.g. 15"
                      className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3.5 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5] block mb-1">Offer Details / Terms</label>
                  <input
                    value={form.offer_text}
                    onChange={e => setForm(f => ({ ...f, offer_text: e.target.value }))}
                    placeholder="e.g. Registration fee waived + 1 free mock test booklet included"
                    className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3.5 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5] block mb-1">Custom Ribbon Badge</label>
                    <input
                      value={form.badge}
                      onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                      placeholder="e.g. Recommended for UPSC"
                      className="w-full bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3.5 py-2 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B] transition"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={Boolean(form.isPopular)}
                        onChange={e => setForm(f => ({ ...f, isPopular: e.target.checked ? 1 : 0 }))}
                        className="w-4 h-4 text-[#1C3A2B] rounded border-[#D9D3C7]"
                      />
                      <span className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5]">Mark as Most Popular</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={Boolean(form.is_active)}
                        onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                        className="w-4 h-4 text-[#1C3A2B] rounded border-[#D9D3C7]"
                      />
                      <span className="text-xs font-semibold text-[#1C1E1B] dark:text-[#FAF8F5]">Published (Active)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 5. Plan Features Bullet Points */}
              <div className="space-y-3 pt-3 border-t border-[#EFEBE4] dark:border-[#26362D]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6D8374] dark:text-[#8CA093] block">
                  5. Plan Features &amp; Inclusions
                </span>

                <div className="space-y-2">
                  {form.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#EDF3EE] dark:bg-[#203126] text-[#2E6B3F] dark:text-[#8FD4AE] flex items-center justify-center flex-shrink-0">
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
                        className="flex-1 bg-[#FAF8F5] dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3 py-1.5 text-xs text-[#1C1E1B] dark:text-white focus:border-[#1C3A2B]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-1.5 text-[#A83232] hover:bg-[#FAF0F0] dark:hover:bg-[#3D1A1A] rounded-lg transition cursor-pointer"
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
                    placeholder="Add a new feature inclusion..."
                    className="flex-1 bg-white dark:bg-[#111A14] border border-[#D9D3C7] dark:border-[#26362D] rounded-xl px-3.5 py-1.5 text-xs text-[#1C1E1B] dark:text-white placeholder-[#8A928C]"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#203126] hover:bg-[#EDF3EE] text-[#1C3A2B] dark:text-[#8FD4AE] border border-[#D9D3C7] dark:border-[#2B4032] rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#EFEBE4] dark:border-[#26362D] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5D645E] dark:text-[#9FB1A6] hover:bg-[#FAF8F5] dark:hover:bg-[#203126] border border-[#D9D3C7] dark:border-[#26362D] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-[#1C3A2B] hover:bg-[#142C20] dark:bg-[#2A4D3B] text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>{editingPkg ? 'Update Package & Timings' : 'Save & Publish Package'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
