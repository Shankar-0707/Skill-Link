import React from "react";
import { Link, useNavigate } from "react-router-dom";

export const LandingNavbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed left-0 right-0 top-3 z-50 flex justify-center px-3 sm:top-4 sm:px-10 lg:px-16">
      <nav className="flex w-full max-w-340 items-center justify-between rounded-full border border-white/60 bg-white/60 px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md sm:px-6 sm:py-4 md:px-8">
        <div className="flex min-w-0 items-center gap-10">
          <Link
            to="/"
            className="z-40 flex min-w-0 items-center gap-2 font-headline text-base font-black uppercase tracking-widest text-slate-900 sm:text-lg"
          >
            <img
              src="/favicon.png"
              alt="Skill-Link Logo"
              className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
            />
            <span className="truncate">Skill-Link</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#home"
              className="text-sm font-semibold text-slate-900 transition-all duration-300 relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 h-0.5 bg-slate-900 transition-all group-hover:w-full w-full"></span>
            </a>
            <Link
              to="/company/about"
              className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-all duration-300 relative group"
            >
              About
              <span className="absolute -bottom-1 left-0 h-0.5 bg-slate-900 transition-all group-hover:w-full w-0"></span>
            </Link>
            <Link
              to="/developers"
              className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-all duration-300 relative group"
            >
              Developers
              <span className="absolute -bottom-1 left-0 h-0.5 bg-slate-900 transition-all group-hover:w-full w-0"></span>
            </Link>
            <a
              href="#contact"
              className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-all duration-300 relative group"
            >
              Contact Us
              <span className="absolute -bottom-1 left-0 h-0.5 bg-slate-900 transition-all group-hover:w-full w-0"></span>
            </a>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <button
            onClick={() => navigate("/login")}
            className="hidden md:flex flex-row items-center justify-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
          >
            Log In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="group relative flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_0_25px_rgba(0,0,0,0.2)] sm:px-5 sm:text-sm"
          >
            <span>Get Started</span>
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
          </button>
        </div>
      </nav>
    </div>
  );
};
