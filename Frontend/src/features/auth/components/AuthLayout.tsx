import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Vortex } from "../../../components/ui/vortex";

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
  showBackButton = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center bg-black">
      {/* Background Component */}
      <div className="absolute inset-0 z-0 bg-black">
        <Vortex 
          backgroundColor="#000000"
          rangeY={800}
          particleCount={500}
          baseSpeed={0.5}
          baseRadius={1}
          containerClassName="h-screen w-full"
        />
      </div>

      {/* Navigation */}
      {showBackButton && (
        <button
          onClick={() => navigate('/')}
          className="absolute left-4 top-4 sm:left-8 sm:top-8 z-50 flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur-xl transition hover:bg-white hover:border-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
      )}

      {/* Content Card */}
      <div className="relative z-10 w-full max-w-[38rem] p-4">
        <div className="rounded-[1.8rem] border border-slate-200/60 bg-white/90 px-6 py-6 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] backdrop-blur-2xl sm:px-10 sm:py-7">
          <div className="mb-4 text-center">
            <h2 className="font-headline text-3xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-[2.5rem] leading-[1.1] mb-1">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[13px] font-medium text-slate-500 sm:text-[15px]">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};
