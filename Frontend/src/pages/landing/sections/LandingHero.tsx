import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, Shield } from 'lucide-react';

export const LandingHero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col lg:flex-row items-center">
      {/* Left Hero Side */}
      <div className="w-full lg:w-[55%] flex flex-col items-start relative z-20">
        <h1 className="font-headline text-5xl sm:text-7xl lg:text-[5.5rem] font-extrabold tracking-[-0.04em] text-slate-950 leading-[0.95] mb-8 drop-shadow-sm">
          Connect talent <br/>
          with confidence.
        </h1>
        
        <p className="text-lg sm:text-xl leading-[1.6] text-slate-500 max-w-[34rem] font-medium mb-12">
          Transforming how businesses hire in India. Verified professionals, seamless project management, and guaranteed quality all in one unified platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
          <button 
            onClick={() => navigate('/register')}
            className="group relative flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-slate-800 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:-translate-y-1"
          >
            Start now
            <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white/50 backdrop-blur-md border border-slate-200 px-8 py-4 text-base font-semibold text-slate-700 transition-all duration-300 hover:bg-white hover:border-slate-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
          >
            Log into account
          </button>
        </div>
        
        {/* Stats/Social Proof */}
        <div className="mt-16 flex items-center gap-8">
            <div className="flex -space-x-3">
              {[...Array(4)].map((_, i) => (
                <img key={i} className="w-10 h-10 rounded-full border-2 border-[#fafbfc] shadow-sm" src={`https://randomuser.me/api/portraits/men/${i + 20}.jpg`} alt="avatar" />
              ))}
            </div>
            <div className="flex flex-col">
              <div className="flex text-yellow-400 gap-0.5">
                {[...Array(5)].map((_, i) => <svg key={i} className="w-4 h-4 fill-current drop-shadow-sm" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
              </div>
              <p className="text-sm font-semibold text-slate-600 mt-1">Trusted by 10,000+ businesses</p>
            </div>
        </div>
      </div>

      {/* Right Hero Side - Dynamic App Preview */}
      <div className="w-full lg:w-[45%] mt-20 lg:mt-0 relative flex justify-center lg:justify-end xl:translate-x-10">
        
        {/* Main Floating Card */}
        <div className="relative w-full max-w-[480px] bg-white/70 backdrop-blur-2xl rounded-3xl border border-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.12)] p-6 z-20 transition-transform duration-700 hover:-translate-y-2 lg:hover:-rotate-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Search className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Find Workers</p>
                <p className="text-xs text-slate-500">Live marketplace</p>
              </div>
            </div>
            <div className="h-8 px-3 bg-green-50 text-green-700 rounded-full flex items-center justify-center text-xs font-bold ring-1 ring-green-600/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-[pulse_2s_ease-in-out_infinite]" />
              24 Online
            </div>
          </div>
          
          {/* List items */}
          <div className="space-y-4">
            {[
              { name: "Rahul Sharma", role: "Electrician", status: "Available", rating: "4.9", verified: true, avatarId: 32 },
              { name: "Nitin", role: "Plumber", status: "In Job", rating: "4.8", verified: true, avatarId: 46 },
              { name: "Amit Kumar", role: "Carpenter", status: "Available", rating: "4.7", verified: false, avatarId: 22 }
            ].map((worker, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl transition-colors hover:bg-slate-50/80 cursor-pointer border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <img className="w-12 h-12 rounded-full border-2 border-white shadow-sm" src={`https://randomuser.me/api/portraits/men/${worker.avatarId}.jpg`} alt={worker.name} />
                  <div>
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                        {worker.name} 
                        {worker.verified && <Shield className="w-3 h-3 text-blue-500 fill-blue-500/20" />}
                    </p>
                    <p className="text-xs font-medium text-slate-500">{worker.role}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center text-xs font-bold text-slate-700 drop-shadow-sm">
                    <span className="text-yellow-400 mr-1">★</span> {worker.rating}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${worker.status === 'Available' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    {worker.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
          <div className="absolute -bottom-8 -left-8 lg:-left-12 w-48 bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] p-4 flex items-center gap-4 z-30 transition-transform hover:scale-105 duration-300">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Job Complete</p>
              <p className="text-[10px] font-semibold text-slate-500">Payment secured</p>
            </div>
        </div>

      </div>

    </div>
  );
};
