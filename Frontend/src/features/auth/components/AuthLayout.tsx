import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  showBackButton = true 
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Left Side: Branding (Desktop Only) */}
      <div className="hidden md:flex md:w-1/2 bg-primary relative items-center justify-center p-12 overflow-hidden">
         {/* Decorative SVG Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 text-center">
          <div className="p-4 bg-white/10 rounded-3xl inline-block mb-8 backdrop-blur-sm border border-white/20">
            <span className="text-on-primary font-black tracking-widest text-3xl">
              SKILL-LINK
            </span>
          </div>
          <h1 className="text-5xl font-black text-white mb-6 leading-tight">
            Connect with<br/>Excellence.
          </h1>
          <p className="text-on-primary/70 text-xl font-medium max-w-sm mx-auto">
            The premium marketplace for skilled workers and growing businesses.
          </p>
        </div>

        {/* Bottom Curve for Mobile Transition */}
        <div className="absolute bottom-0 left-0 w-full md:hidden">
          <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-20 w-full" fill="#f8f9fb">
            <path d="M0,150 L500,150 L500,0 C250,150 0,0 0,0 Z"></path>
          </svg>
        </div>
      </div>

      {/* Mobile Top Bar (Only visible on mobile) */}
      <div className="md:hidden flex items-center justify-between p-6 bg-primary text-white">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <span className="font-bold tracking-widest text-sm">SKILL-LINK</span>
        </div>
        <div className="w-8"></div>
      </div>

      {/* Right Side: Form Content */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background relative overflow-y-auto">
        {/* Back Button (Desktop Only) */}
        {showBackButton && (
           <button 
             onClick={() => navigate(-1)}
             className="hidden md:flex absolute top-8 left-8 p-3 bg-secondary-container rounded-2xl hover:bg-surface-container-high transition-colors text-primary items-center gap-2 font-bold"
           >
             <ArrowLeft className="w-5 h-5" />
             Back
           </button>
        )}

        <div className="w-full max-w-md p-8 md:p-12">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-4xl font-black text-primary tracking-tight mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-on-surface-variant font-semibold text-lg">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="bg-white/50 backdrop-blur-sm border border-border/50 rounded-[2.5rem] p-0 shadow-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
