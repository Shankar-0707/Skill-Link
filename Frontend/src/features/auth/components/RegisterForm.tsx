import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  Briefcase,
} from 'lucide-react';
import { authApi } from '../api/auth';
import { GoogleAuthButton } from './GoogleAuthButton';
import { Role } from '../types';
import { resolveApiErrorMessage } from '../utils/errorMessage';
import { cn } from '../../../shared/utils/cn';

const roleOptions = [
  { id: Role.CUSTOMER, label: 'Customer', icon: User },
  { id: Role.WORKER, label: 'Worker', icon: Briefcase },
  { id: Role.ORGANISATION, label: 'Organisation', icon: Building2 },
];

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: Role.CUSTOMER as Role,
    email: '',
    password: '',
    name: '',
    phone: '',
    businessName: '',
    businessType: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await authApi.register({
        role: formData.role,
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name.trim(),
        phone: formData.role === Role.ORGANISATION ? undefined : formData.phone.trim(),
        businessName: formData.role === Role.ORGANISATION ? formData.businessName.trim() : undefined,
        businessType: formData.role === Role.ORGANISATION ? formData.businessType.trim() : undefined,
      });

      navigate('/check-email', { 
        state: { email: formData.email.trim() },
        replace: true 
      });
    } catch (error) {
      setErrorMessage(resolveApiErrorMessage(error, 'Registration failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-in fade-in duration-500">
      {/* Segmented Control for Role */}
      <div className="flex bg-slate-100/80 p-1.5 rounded-[1.1rem] w-full mt-1">
        {roleOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setFormData({ ...formData, role: option.id })}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-bold transition-all duration-300",
              formData.role === option.id 
                ? "bg-white text-slate-900 shadow-[0_2px_12px_rgba(0,0,0,0.06)]" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            )}
          >
            <option.icon className={cn("w-3.5 h-3.5", formData.role === option.id ? "text-slate-900" : "text-slate-400")} />
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5">
        {/* Name */}
        <div className="space-y-1">
          <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Full Name</label>
          <div className="relative group">
            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-slate-900" />
            <input
              type="text"
              required
              placeholder="Enter your name"
              value={formData.name}
              className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-500 focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-slate-900" />
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={formData.email}
              className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-500 focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Password</label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-slate-900" />
            <input
              type="password"
              required
              minLength={8}
              placeholder="Create a password"
              value={formData.password}
              className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-500 focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        {/* Dynamic Fields */}
        {formData.role === Role.ORGANISATION ? (
          <>
            <div className="space-y-1">
              <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Business Name</label>
              <div className="relative group">
                <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-slate-900" />
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  placeholder="Enter business name"
                  className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-500 focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100"
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Business Type</label>
              <select
                value={formData.businessType}
                required
                className="w-full appearance-none rounded-[1.1rem] border border-slate-200 bg-slate-50/80 py-2.5 px-4 text-sm text-slate-900 outline-none transition-all focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100"
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
              >
                <option value="" disabled>Select business type</option>
                <option value="AGENCY">Agency</option>
                <option value="RETAIL">Retail</option>
                <option value="SERVICES">Services</option>
              </select>
            </div>
          </>
        ) : (
          <div className="space-y-1">
            <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Phone Number</label>
            <div className="relative group">
              <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-slate-900" />
              <input
                type="tel"
                required
                value={formData.phone}
                placeholder="+91 XXXXX XXXXX"
                className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-500 focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100"
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <p className="rounded-[1rem] border border-red-200 bg-red-50/80 px-3 py-1.5 text-[12px] font-semibold text-red-700 text-center">
          {errorMessage}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-0">
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full cursor-pointer rounded-[1.1rem] bg-slate-900 py-2.5 text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-all active:scale-[0.98]",
            isLoading ? "cursor-not-allowed opacity-70" : "hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgba(0,0,0,0.18)]"
          )}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>

        <div className="flex items-center gap-4 py-0">
          <div className="h-[1px] flex-1 bg-slate-200" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Or use</span>
          <div className="h-[1px] flex-1 bg-slate-200" />
        </div>

        <GoogleAuthButton mode="register" role={formData.role} />
      </div>

      <div className="text-center mt-1">
        <p className="text-[13px] font-medium text-slate-500">
          Already using Skill-Link?{' '}
          <Link to="/login" className="font-bold text-slate-900 transition hover:underline">
            Sign In
          </Link>
        </p>
      </div>

    </form>
  );
};
