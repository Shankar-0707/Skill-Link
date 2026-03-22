import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Building2, Briefcase, ChevronRight } from 'lucide-react';
import { Role } from '../types';
import { cn } from '../../../shared/utils/cn';

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

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) return nextStep();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step Indicator */}
      <div className="flex justify-between items-center mt-4 px-4 pb-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
              step === s ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" :
                step > s ? "bg-success text-white" : "bg-secondary text-muted-foreground"
            )}>
              {s}
            </div>
            {s < 3 && <div className={cn("w-12 h-1 ml-2 rounded-full", step > s ? "bg-success" : "bg-secondary")} />}
          </div>
        ))}
      </div>

      {/* Step 1: Role Selection */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="text-xl font-bold text-center mb-6">Who are you?</h2>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: Role.CUSTOMER, label: 'I want to hire', icon: User },
              { id: Role.WORKER, label: 'I want to work', icon: Briefcase },
              { id: Role.ORGANISATION, label: 'I am a business', icon: Building2 },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setFormData({ ...formData, role: r.id });
                  nextStep();
                }}
                className={cn(
                  "flex items-center p-4 rounded-2xl border-2 transition-all hover:border-primary group",
                  formData.role === r.id ? "border-primary bg-primary/5 shadow-md" : "border-secondary bg-secondary/30"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-colors",
                  formData.role === r.id ? "bg-primary text-white" : "bg-white text-muted-foreground group-hover:text-primary"
                )}>
                  <r.icon className="w-6 h-6" />
                </div>
                <span className="font-bold text-lg">{r.label}</span>
                <ChevronRight className="ml-auto w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Basic Info */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/70 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text" required placeholder="Enter your name"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary focus:bg-white border-transparent focus:border-primary transition-all outline-none font-medium"
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/70 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email" required placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary focus:bg-white border-transparent focus:border-primary transition-all outline-none font-medium"
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/70 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password" required placeholder="Create a password"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary focus:bg-white border-transparent focus:border-primary transition-all outline-none font-medium"
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Role Specific */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          {formData.role === Role.ORGANISATION ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/70 ml-1">Business Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="text" required placeholder="Enter your business name" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary outline-none" onChange={e => setFormData({ ...formData, businessName: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/70 ml-1">Business Type</label>
                <select className="w-full px-4 py-4 rounded-2xl bg-secondary outline-none font-medium appearance-none" onChange={e => setFormData({ ...formData, businessType: e.target.value })}>
                  <option value="AGENCY">Agency</option>
                  <option value="RETAIL">Retail</option>
                  <option value="SERVICES">Services</option>
                </select>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/70 ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="tel" required placeholder="+91 XXXXX XXXXX" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary outline-none" onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>
          )}
        </div>
      )}

      {step > 1 && (
        <div className="flex gap-4 pt-4">
          <button
            type="button" onClick={prevStep}
            className="flex-1 py-4 rounded-2xl bg-secondary text-primary font-bold hover:bg-muted transition-all"
          >
            Back
          </button>
          <button
            type="submit" disabled={isLoading}
            className="flex-[2] py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
          >
            {step === 3 ? (isLoading ? 'Creating...' : 'Finalize') : 'Continue'}
          </button>
        </div>
      )}

      <div className="text-center">
        <p className="text-sm text-muted-foreground font-medium">
          Already using Skill-Link?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </form>
  );
};
