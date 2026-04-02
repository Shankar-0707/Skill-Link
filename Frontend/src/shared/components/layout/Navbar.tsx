import React from 'react';
import { Search, Bell, MessageSquare } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export const Navbar: React.FC = () => {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Global Search..." 
            className="w-full pl-10 pr-4 py-2 bg-secondary/50 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <nav className="flex items-center gap-8">
        {['Browse', 'Recent', 'Trending'].map((label) => (
          <a 
            key={label} 
            href="#" 
            className={`text-sm font-bold transition-colors ${label === 'Browse' ? 'text-primary border-b-2 border-primary pb-1' : 'text-muted-foreground hover:text-primary'}`}
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-4 w-1/3 justify-end">
        <Button variant="ghost" className="text-sm font-bold text-muted-foreground hover:text-primary">
          Support
        </Button>
        <Button className="bg-black text-white hover:bg-black/90 rounded-lg font-bold text-sm px-6">
          Create Request
        </Button>
        
        <div className="flex items-center gap-2 ml-4">
          <button className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors">
            <MessageSquare className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden border-2 border-white cursor-pointer ml-2">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
