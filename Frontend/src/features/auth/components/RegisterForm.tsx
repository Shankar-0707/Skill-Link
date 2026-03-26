import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import { authApi } from '../api/auth';
import { GoogleAuthButton } from './GoogleAuthButton';
import { Role } from '../types';
import { resolveApiErrorMessage } from '../utils/errorMessage';
import { cn } from '../../../shared/utils/cn';
import { Button } from '@/shared/components/ui/button';

const roleOptions = [
  {
    id: Role.CUSTOMER,
    label: 'I want to hire',
    description: 'Find the right skilled person quickly.',
    icon: User,
  },
  {
    id: Role.WORKER,
    label: 'I want to work',
    description: 'Show your expertise and win better work.',
    icon: Briefcase,
  },
  {
    id: Role.ORGANISATION,
    label: 'I am a business',
    description: 'Manage team demand and business growth.',
    icon: Building2,
  },
];

export const RegisterForm: React.FC = () => {
  const [step, setStep] = useState(1);
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) return nextStep();

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const response = await authApi.register({
        role: formData.role,
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name.trim(),
        phone:
          formData.role === Role.ORGANISATION ? undefined : formData.phone.trim(),
        businessName:
          formData.role === Role.ORGANISATION
            ? formData.businessName.trim()
            : undefined,
        businessType:
          formData.role === Role.ORGANISATION
            ? formData.businessType.trim()
            : undefined,
      });

      setSuccessMessage(
        response.message ||
          'Registration successful. Please verify your email from the inbox link.',
      );
      setStep(1);
      setFormData({
        role: Role.CUSTOMER,
        email: '',
        password: '',
        name: '',
        phone: '',
        businessName: '',
        businessType: '',
      });
    } catch (error) {
      setErrorMessage(
        resolveApiErrorMessage(error, 'Registration failed. Please try again.'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const progressValue = ((step - 1) / 2) * 100;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50/80 px-5 py-5">
        <div className="mb-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          <span>Setup progress</span>
          <span>Step {step} of 3</span>
        </div>

        <div className="relative">
          <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
          <div
            className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressValue}%` }}
          />
          <div className="relative flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-bold transition-all duration-300',
                  step === s
                    ? 'border-primary bg-primary text-white shadow-[0_14px_28px_rgba(2,6,23,0.18)]'
                    : step > s
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-200 bg-white text-slate-400',
                )}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="space-y-1 text-center">
            <h2 className="text-3xl font-bold tracking-[-0.03em] text-slate-900">
              Who are you?
            </h2>
            <p className="text-base text-slate-500">
              Choose how you want to use Skill-Link.
            </p>
          </div>

          <div className="grid gap-4">
            {roleOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setFormData({ ...formData, role: option.id });
                  nextStep();
                }}
                className={cn(
                  'group flex items-center rounded-[1.5rem] border px-5 py-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_18px_40px_rgba(15,23,42,0.06)]',
                  formData.role === option.id
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-slate-200 bg-white',
                )}
              >
                <div
                  className={cn(
                    'mr-4 flex h-16 w-16 items-center justify-center rounded-[1.35rem] border transition-colors',
                    formData.role === option.id
                      ? 'border-primary bg-primary text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-500',
                  )}
                >
                  <option.icon className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold tracking-[-0.03em] text-slate-900">
                    {option.label}
                  </p>
                  <p className="mt-1 text-lg leading-7 text-slate-500">
                    {option.description}
                  </p>
                </div>
                <ChevronRight className="h-6 w-6 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Selected role
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {roleOptions.find((option) => option.id === formData.role)?.label}
            </p>
          </div>

          <div className="space-y-2.5">
            <label className="ml-1 text-sm font-semibold text-slate-700">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Enter your name"
                value={formData.name}
                className="w-full rounded-[1.35rem] border border-slate-200 bg-slate-50/80 py-4 pl-12 pr-4 font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="ml-1 text-sm font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={formData.email}
                className="w-full rounded-[1.35rem] border border-slate-200 bg-slate-50/80 py-4 pl-12 pr-4 font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="ml-1 text-sm font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={8}
                placeholder="Create a password"
                value={formData.password}
                className="w-full rounded-[1.35rem] border border-slate-200 bg-slate-50/80 py-4 pl-12 pr-4 font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 py-1">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
              Or continue with
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <GoogleAuthButton mode="register" role={formData.role} />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Final step
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              Add the last details for your account.
            </p>
          </div>

          {formData.role === Role.ORGANISATION ? (
            <>
              <div className="space-y-2.5">
                <label className="ml-1 text-sm font-semibold text-slate-700">Business Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    placeholder="Enter your business name"
                    className="w-full rounded-[1.35rem] border border-slate-200 bg-slate-50/80 py-4 pl-12 pr-4 font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="ml-1 text-sm font-semibold text-slate-700">Business Type</label>
                <select
                  value={formData.businessType}
                  className="w-full appearance-none rounded-[1.35rem] border border-slate-200 bg-slate-50/80 px-4 py-4 font-medium text-slate-900 outline-none transition-all focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
                  onChange={(e) =>
                    setFormData({ ...formData, businessType: e.target.value })
                  }
                >
                  <option value="">Select business type</option>
                  <option value="AGENCY">Agency</option>
                  <option value="RETAIL">Retail</option>
                  <option value="SERVICES">Services</option>
                </select>
              </div>
            </>
          ) : (
            <div className="space-y-2.5">
              <label className="ml-1 text-sm font-semibold text-slate-700">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full rounded-[1.35rem] border border-slate-200 bg-slate-50/80 py-4 pl-12 pr-4 font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <p className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          {successMessage}
        </p>
      )}

      {step > 1 && (
        <div className="flex gap-4 pt-2">
          <Button
            type="button"
            onClick={prevStep}
            className="h-14 flex-1 rounded-[1.35rem] border border-slate-200 bg-white text-primary shadow-none transition-all hover:bg-slate-50"
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-14 flex-[1.8] rounded-[1.35rem] bg-[linear-gradient(135deg,#000613_0%,#0b1b33_100%)] text-white shadow-[0_18px_35px_rgba(2,6,23,0.22)] transition-all hover:-translate-y-0.5 hover:opacity-100"
          >
            {step === 3 ? (isLoading ? 'Creating...' : 'Create account') : 'Continue'}
          </Button>
        </div>
      )}

      <div className="border-t border-slate-200/80 pt-4 text-center">
        <p className="text-sm font-medium text-slate-500">
          Already using Skill-Link?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </form>
  );
};
