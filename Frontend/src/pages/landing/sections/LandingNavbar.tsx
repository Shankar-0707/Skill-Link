import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LandingNavbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 sm:px-10 lg:px-16">
      <nav className="w-full max-w-[85rem] flex items-center justify-between py-4 backdrop-blur-md bg-white/50 border border-white/60 rounded-full px-6 md:px-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center gap-10">
          <div className="flex z-40 font-headline font-black tracking-widest text-lg text-slate-900 uppercase items-center gap-2">
            <img src="/favicon.png" alt="Skill-Link Logo" className="w-10 h-10 object-contain" />
            Skill-Link
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-all duration-300 relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-900 transition-all group-hover:w-full"></span>
            </a>
            <a href="#" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-all duration-300 relative group">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-900 transition-all group-hover:w-full"></span>
            </a>
            <a href="#" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-all duration-300 relative group">
              Contact Us
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-900 transition-all group-hover:w-full"></span>
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="hidden md:flex flex-row items-center justify-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
          >
            Log In
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="group relative flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-all duration-300 hover:bg-slate-800 hover:shadow-[0_0_25px_rgba(0,0,0,0.2)] hover:-translate-y-0.5"
          >
            <span>Get Started</span>
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
          </button>
        </div>
      </nav>
    </div>
  );
};
