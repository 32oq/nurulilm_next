'use client';

import { useState } from 'react';
import { UserPlus, Loader2, Mail, Phone, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = ({ setPage }) => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    user_type: 'Patron',
    paid: '0'
  });

  const [showPassword, setShowPassword] = useState(false);

  const {
    state: { loading, error },
    register
  } = useAuth();

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'paid') {
      setForm(prev => ({ ...prev, paid: checked ? '1' : '0' }));
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await register(form)) {
      setPage('packages', 'signup');
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 py-12 bg-[#FCFCFB] dark:bg-[#0E1411] transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-[#16211B] border border-[#DFE6DC] dark:border-[#26362D] rounded-2xl p-7 sm:p-9 shadow-sm transition-all">

        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF4EC] dark:bg-[#1E2E25] text-[#33462C] dark:text-[#8FD4AE] mx-auto flex items-center justify-center mb-3 shadow-2xs">
            <UserPlus size={22} strokeWidth={2} />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#33462C] dark:text-[#88B89C]">
            New Admission
          </span>
          <h1 className="font-serif-lib text-2xl sm:text-3xl font-bold text-[#24341E] dark:text-[#8FD4AE] mt-0.5">
            Create Library Account
          </h1>
          <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6] mt-1 leading-relaxed">
            Enroll for peaceful study desks, reading passes, and digital catalog access.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-5 bg-[#FAF0F0] dark:bg-[#281616] text-[#A83232] dark:text-[#F87171] border border-[#F0D5D5] dark:border-[#4B1E1E] p-3.5 rounded-xl text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="first_name" className="block text-xs font-semibold text-[#24341E] dark:text-[#E5EBE7] mb-1">
                First Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7F8781]">
                  <User size={15} />
                </div>
                <input
                  id="first_name"
                  type="text"
                  name="first_name"
                  placeholder="e.g. Zubair"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#2C3E32] rounded-xl text-xs text-[#0B0E0A] dark:text-[#E8EFEA] placeholder-[#8A928C] focus:bg-white dark:focus:bg-[#16211B] focus:border-[#33462C] dark:focus:border-[#8FD4AE] focus:ring-1 focus:ring-[#33462C] transition shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="last_name" className="block text-xs font-semibold text-[#24341E] dark:text-[#E5EBE7] mb-1">
                Last Name
              </label>
              <input
                id="last_name"
                type="text"
                name="last_name"
                placeholder="e.g. Peerzada"
                value={form.last_name}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#2C3E32] rounded-xl text-xs text-[#0B0E0A] dark:text-[#E8EFEA] placeholder-[#8A928C] focus:bg-white dark:focus:bg-[#16211B] focus:border-[#33462C] dark:focus:border-[#8FD4AE] focus:ring-1 focus:ring-[#33462C] transition shadow-2xs"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-[#24341E] dark:text-[#E5EBE7] mb-1">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7F8781]">
                <Mail size={15} />
              </div>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#2C3E32] rounded-xl text-xs text-[#0B0E0A] dark:text-[#E8EFEA] placeholder-[#8A928C] focus:bg-white dark:focus:bg-[#16211B] focus:border-[#33462C] dark:focus:border-[#8FD4AE] focus:ring-1 focus:ring-[#33462C] transition shadow-2xs"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone_number" className="block text-xs font-semibold text-[#24341E] dark:text-[#E5EBE7] mb-1">
              Mobile Number (10 digits) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7F8781]">
                <Phone size={15} />
              </div>
              <input
                id="phone_number"
                type="text"
                name="phone_number"
                placeholder="9906000000"
                value={form.phone_number}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#2C3E32] rounded-xl text-xs text-[#0B0E0A] dark:text-[#E8EFEA] placeholder-[#8A928C] focus:bg-white dark:focus:bg-[#16211B] focus:border-[#33462C] dark:focus:border-[#8FD4AE] focus:ring-1 focus:ring-[#33462C] transition shadow-2xs"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg_password" className="block text-xs font-semibold text-[#24341E] dark:text-[#E5EBE7] mb-1">
              Create Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7F8781]">
                <Lock size={15} />
              </div>
              <input
                id="reg_password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-10 py-2.5 bg-[#FCFCFB] dark:bg-[#121B16] border border-[#DFE6DC] dark:border-[#2C3E32] rounded-xl text-xs text-[#0B0E0A] dark:text-[#E8EFEA] placeholder-[#8A928C] focus:bg-white dark:focus:bg-[#16211B] focus:border-[#33462C] dark:focus:border-[#8FD4AE] focus:ring-1 focus:ring-[#33462C] transition shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7F8781] hover:text-[#24341E] dark:hover:text-white cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Offline membership interest checkbox */}
          <label className="flex items-start gap-2.5 text-xs text-[#0B0E0A] dark:text-[#9FB1A6] cursor-pointer pt-1">
            <input
              type="checkbox"
              name="paid"
              checked={form.paid === '1'}
              onChange={handleChange}
              className="mt-0.5 rounded border-[#DFE6DC] dark:border-[#2C3E32] text-[#33462C] focus:ring-[#33462C]"
            />
            <span>I plan to study on premise at the Handwara library center</span>
          </label>

          {/* Submit */}
          <button
            disabled={loading}
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#33462C] hover:bg-[#24341E] dark:bg-[#346F4F] dark:hover:bg-[#3F845F] text-white font-semibold py-2.5 px-4 rounded-xl transition disabled:opacity-50 text-xs shadow-sm mt-3 cursor-pointer active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Register &amp; Select Membership</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#DFE6DC] dark:border-[#26362D] text-center">
          <p className="text-xs text-[#0B0E0A] dark:text-[#9FB1A6]">
            Already enrolled at Nurul Ilm?{' '}
            <button
              type="button"
              onClick={() => setPage('login')}
              className="font-semibold text-[#33462C] dark:text-[#8FD4AE] hover:underline ml-1 cursor-pointer"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
