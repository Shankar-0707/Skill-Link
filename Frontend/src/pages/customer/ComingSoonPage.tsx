import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout as CustomerLayout } from '../../features/customer/components/layout/Layout';
import { WorkerLayout } from '../../features/worker/components/layout/Layout';
import { Zap, ArrowLeft } from 'lucide-react';

export const ComingSoonPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isWorkerPath = location.pathname.startsWith('/worker');
  const Layout = isWorkerPath ? WorkerLayout : CustomerLayout;
  const homePath = isWorkerPath ? '/worker/dashboard' : '/user/home';
  const homeLabel = isWorkerPath ? 'Back to Dashboard' : 'Back to Marketplace';

  // Determine page title based on path
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    if (!path) return 'Feature';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const title = getPageTitle();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        {/* Animated icon container */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-foreground/5 rounded-full blur-3xl scale-150 animate-pulse" />
          <div className="relative w-24 h-24 bg-foreground rounded-3xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-500 shadow-2xl">
            <Zap className="w-10 h-10 text-background" fill="currentColor" />
          </div>
        </div>

        {/* Text content */}
        <h1 className="font-headline font-bold text-4xl text-foreground mb-4 tracking-tight">
          {title} <span className="text-muted-foreground/40 font-light">Coming Soon</span>
        </h1>
        
        <p className="max-w-md text-muted-foreground font-body text-lg leading-relaxed mb-10">
          We're building a state-of-the-art {title.toLowerCase()} management system to help you streamline your hyperlocal operations. Hang tight!
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(homePath)}
            className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-label font-semibold hover:opacity-90 transition-opacity shadow-lg"
          >
            {homeLabel}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 border border-border text-foreground rounded-xl font-label font-semibold hover:bg-surface-container transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mt-16 w-full max-w-xs">
          <div className="flex justify-between text-[10px] font-label font-bold uppercase tracking-widest text-muted-foreground mb-2">
            <span>Development Progress</span>
            <span>65%</span>
          </div>
          <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-foreground w-[65%] rounded-full" />
          </div>
        </div>
      </div>
    </Layout>
  );
};
