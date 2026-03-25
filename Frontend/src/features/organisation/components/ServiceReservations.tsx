import React from 'react';
import { User, ChevronRight } from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';

const reservations = [
  {
    id: 1,
    name: 'Marcus Holloway',
    service: 'BRAKE ALIGNMENT SERVICE',
    time: '14:30 PM',
  },
  {
    id: 2,
    name: 'Sarah Jenkins',
    service: 'OIL CHANGE & FILTER',
    time: '15:45 PM',
  },
];

export const ServiceReservations: React.FC = () => {
  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <h3 className="font-headline font-bold text-xl text-primary">Service Reservations</h3>
        <button className="text-sm font-bold border-b-2 border-primary/10 hover:border-primary transition-all flex items-center gap-1">
          View All <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 flex-1">
        {reservations.map((res) => (
          <div key={res.id} className="bg-white border p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-2xl"></div>
            <div className="flex items-start justify-between mb-6">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-bold text-primary">{res.name}</h4>
                  <p className="text-[10px] text-muted-foreground font-bold tracking-widest">{res.service}</p>
                </div>
              </div>
              <div className="bg-secondary px-3 py-1.5 rounded-lg">
                <span className="text-xs font-bold text-primary">{res.time}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-primary text-white hover:bg-primary/90 font-bold text-xs py-5 rounded-lg uppercase tracking-wide">
                Confirm
              </Button>
              <Button className="flex-1 bg-secondary text-primary hover:bg-muted border border-border font-bold text-xs py-5 rounded-lg uppercase tracking-wide">
                Reschedule
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
