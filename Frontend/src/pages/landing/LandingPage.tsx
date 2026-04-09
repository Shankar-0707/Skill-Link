import React from 'react';
import { LandingNavbar } from './sections/LandingNavbar';
import { LandingHero } from './sections/LandingHero';

export const LandingPage: React.FC = () => {

  return (
    <div className="relative min-h-screen bg-[#fafbfc] overflow-hidden font-body selection:bg-slate-900 selection:text-white">
      {/* Corner Gradients - Enhanced for Premium Look */}
      <div className="absolute -top-[30%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-b from-slate-200/50 to-transparent blur-[100px] -z-10 mix-blend-multiply opacity-70" />
      <div className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-slate-200/60 to-transparent blur-[120px] -z-10 mix-blend-multiply opacity-60" />
      <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-blue-100/30 blur-[120px] -z-10 mix-blend-multiply" />

      {/* Fixed Navbar Component */}
      <LandingNavbar />

      <div className="relative z-10 max-w-[85rem] mx-auto px-6 sm:px-10 lg:px-16 pt-32 lg:pt-36 pb-24">
        {/* Abstracted Hero Component */}
        <LandingHero />
      </div>
    </div>
  );
};
