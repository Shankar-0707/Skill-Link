import React from 'react';
import { MapPin, Star } from 'lucide-react';
import type { Worker } from '../types/index';

// ── Worker Card (Marketplace / Browse Workers) ────────────────────────────────

interface WorkerCardProps {
  worker: Worker;
  onHire: (worker: Worker) => void;
  onViewProfile: (worker: Worker) => void;
  distanceMiles?: number;
  startsFrom?: number;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  onHire,
  onViewProfile,
  distanceMiles,
  startsFrom,
}) => (
  <div className="bg-background border border-border rounded-2xl p-5 hover:shadow-md hover:border-outline transition-all duration-200 cursor-pointer"
       onClick={() => onViewProfile(worker)}>
    {/* Header */}
    <div className="flex items-start gap-3 mb-4">
      <div className="relative">
        <img
          src={worker.user.profileImage ?? `https://i.pravatar.cc/56?u=${worker.id}`}
          alt={worker.user.name}
          className="w-14 h-14 rounded-xl object-cover"
        />
        {/* Availability dot */}
        <span
          className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-background
            ${worker.isAvailable ? 'bg-green-500' : 'bg-muted-foreground'}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-semibold text-sm text-foreground truncate">
            {worker.user.name ?? 'Worker'}
          </h3>
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-label font-semibold text-foreground">
              {worker.ratingAvg.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">({worker.ratingCount})</span>
          </div>
        </div>
        <p className="text-xs font-body text-muted-foreground mt-0.5 line-clamp-1">
          {worker.skills.slice(0, 2).join(' & ')} {worker.skills.length > 2 ? `+${worker.skills.length - 2}` : ''}
        </p>
        {distanceMiles !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{distanceMiles} miles away</span>
          </div>
        )}
      </div>
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between pt-3 border-t border-border">
      <div>
        <p className="text-[10px] font-label text-muted-foreground uppercase tracking-wide">Starts from</p>
        <p className="text-base font-headline font-bold text-foreground">
          ₹{startsFrom?.toLocaleString() ?? '—'}<span className="text-xs font-body text-muted-foreground">/hr</span>
        </p>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onHire(worker); }}
        className="px-4 py-2 bg-foreground text-background text-xs font-label font-semibold rounded-lg hover:opacity-90 transition-opacity"
        disabled={!worker.isAvailable}
      >
        {worker.isAvailable ? 'Hire Expert' : 'Unavailable'}
      </button>
    </div>
  </div>
);

// ── Worker List Row (Browse Workers page — compact view) ──────────────────────

interface WorkerRowProps {
  worker: Worker;
  onViewProfile: (worker: Worker) => void;
}

export const WorkerRow: React.FC<WorkerRowProps> = ({ worker, onViewProfile }) => (
  <div
    className="flex items-center gap-4 p-4 bg-background border border-border rounded-xl hover:border-outline hover:shadow-sm transition-all cursor-pointer"
    onClick={() => onViewProfile(worker)}
  >
    <div className="relative flex-shrink-0">
      <img
        src={worker.user.profileImage ?? `https://i.pravatar.cc/48?u=${worker.id}`}
        alt={worker.user.name}
        className="w-12 h-12 rounded-xl object-cover"
      />
      <span
        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background
          ${worker.isAvailable ? 'bg-green-500' : 'bg-muted-foreground'}`}
      />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h3 className="font-label font-semibold text-sm text-foreground">{worker.user.name ?? 'Worker'}</h3>
        <div className="flex items-center gap-0.5">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-xs font-label text-foreground">{worker.ratingAvg.toFixed(1)}</span>
        </div>
      </div>
      <p className="text-xs font-body text-muted-foreground truncate">{worker.skills.join(', ')}</p>
    </div>
    <div className="text-right flex-shrink-0">
      <p className="text-xs text-muted-foreground">{worker.experience ?? 0}+ yrs</p>
      <span className={`text-xs font-label font-medium ${worker.isAvailable ? 'text-green-600' : 'text-muted-foreground'}`}>
        {worker.isAvailable ? 'Available' : 'Busy'}
      </span>
    </div>
  </div>
);