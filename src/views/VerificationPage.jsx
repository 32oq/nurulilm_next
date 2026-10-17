'use client';

import { useState, useRef } from 'react';
import { Loader2, ShieldCheck, User, MapPin, Building, FileCheck, Camera, UploadCloud, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const VerificationPage = ({ setPage, onSuccess }) => {
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoBase64, setPhotoBase64] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    father_name: '',
    aadhaar_id: '',
    police_station: '',
    city: '',
    consent: 0
  });

  const {
    state: { user, loading, error },
    completeOnboarding
  } = useAuth();

  const handlePhotoSelect = (file) => {
    setPhotoError('');
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setPhotoError('Invalid image format. Only JPEG, PNG, and WebP are accepted.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setPhotoError('Image file is too large. Maximum allowed size is 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      setPhotoPreview(result);
      setPhotoBase64(result);
    };
    reader.onerror = () => {
      setPhotoError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoBase64('');
    setPhotoError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked ? 1 : 0 }));
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPhotoError('');

    if (!photoBase64 && !user?.profile_photo) {
      setPhotoError('Profile photo is mandatory for identity verification and digital ID issuance.');
      return;
    }

    if (!form.consent) return;

    try {
      const payload = {
        ...form,
        photo: photoBase64 || user?.profile_photo
      };

      await completeOnboarding(payload);
      setSuccessMessage('✓ Identity verification submitted & Digital Library Card issued successfully!');

      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (setPage) setPage('dashboard');
      }, 1500);
    } catch (err) {
      setPhotoError(err.message || 'Onboarding submission failed');
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-0">
      <div className="max-w-lg w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-xs">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#004B87] dark:text-blue-400 mx-auto flex items-center justify-center mb-2.5">
            <ShieldCheck size={24} strokeWidth={2} />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Mandatory Patron Compliance
          </span>
          <h2 className="font-serif-lib text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            Scholar Identity &amp; Photo Verification
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Upload your verified portrait photo and official Aadhaar credentials to activate your digital library card and carrel seat reservation.
          </p>
        </div>

        {successMessage && (
          <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 p-3 rounded-lg text-xs text-center font-medium flex items-center justify-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {(error || photoError) && (
          <div className="mb-4 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 p-2.5 rounded-lg text-xs text-center font-medium flex items-center justify-center gap-1.5">
            <AlertCircle size={15} />
            <span>{photoError || error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>

          {/* ── MANDATORY PROFILE PHOTO UPLOAD ── */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                Official Portrait Photo (Mandatory) *
              </label>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                JPEG, PNG, WebP • Max 2MB
              </span>
            </div>

            {photoPreview || user?.profile_photo ? (
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-[#004B87] dark:border-blue-500 shadow-xs flex-shrink-0 bg-white">
                  <img
                    src={photoPreview || user?.profile_photo}
                    alt="Patron portrait preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-[#004B87] dark:text-blue-400 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Photo Verified Ready
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    This photo will be printed on your digital library card.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-[#004B87] dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Change Photo
                    </button>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="py-5 px-4 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition cursor-pointer flex flex-col items-center justify-center space-y-1.5"
              >
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-[#004B87] dark:text-blue-400 flex items-center justify-center">
                  <Camera size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Click to browse or drag &amp; drop portrait photo
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Clear face photo on neutral background required
                  </p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handlePhotoSelect(e.target.files?.[0])}
              className="hidden"
            />
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name (as on Aadhaar) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <User size={15} />
              </div>
              <input
                id="full_name"
                type="text"
                name="full_name"
                placeholder="Full official name"
                value={form.full_name}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#004B87] dark:focus:ring-blue-500 focus:border-[#004B87] dark:focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Father's Name */}
          <div>
            <label htmlFor="father_name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Father's / Guardian's Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <User size={15} />
              </div>
              <input
                id="father_name"
                type="text"
                name="father_name"
                placeholder="Father's or Guardian's name"
                value={form.father_name}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#004B87] dark:focus:ring-blue-500 focus:border-[#004B87] dark:focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Aadhaar ID */}
          <div>
            <label htmlFor="aadhaar_id" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Aadhaar Card Number (12 digits) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <FileCheck size={15} />
              </div>
              <input
                id="aadhaar_id"
                type="text"
                name="aadhaar_id"
                placeholder="1234 5678 9012"
                value={form.aadhaar_id}
                onChange={handleChange}
                maxLength={12}
                pattern="[0-9]{12}"
                required
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#004B87] dark:focus:ring-blue-500 focus:border-[#004B87] dark:focus:border-blue-500 transition font-mono"
              />
            </div>
          </div>

          {/* Police Station & City Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="police_station" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Police Station *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Building size={14} />
                </div>
                <input
                  id="police_station"
                  type="text"
                  name="police_station"
                  placeholder="e.g. Handwara"
                  value={form.police_station}
                  onChange={handleChange}
                  required
                  className="w-full pl-8 pr-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#004B87] dark:focus:ring-blue-500 focus:border-[#004B87] dark:focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="city" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City / Town *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <MapPin size={14} />
                </div>
                <input
                  id="city"
                  type="text"
                  name="city"
                  placeholder="e.g. Handwara / Kupwara"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full pl-8 pr-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#004B87] dark:focus:ring-blue-500 focus:border-[#004B87] dark:focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Explicit Informed Consent */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                id="kyc-consent-box"
                type="checkbox"
                name="consent"
                checked={form.consent === 1}
                onChange={handleChange}
                required
                className="mt-0.5 rounded border-slate-300 dark:border-slate-700 text-[#004B87] focus:ring-[#004B87] cursor-pointer"
              />
              <span className="leading-relaxed">
                I affirm that my submitted identity details and photograph are authentic. I consent to their institutional use for library identity card generation, attendance security, and regulatory verification under the{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#004B87] dark:text-blue-400 font-semibold underline">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#004B87] dark:text-blue-400 font-semibold underline">
                  Terms of Use
                </a>.
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            disabled={loading || !form.consent || (!photoBase64 && !user?.profile_photo)}
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#004B87] hover:bg-[#003865] text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 text-xs shadow-xs mt-3 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                <span>Verifying &amp; Generating ID Card...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Submit &amp; Generate Digital Library Card</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerificationPage;
