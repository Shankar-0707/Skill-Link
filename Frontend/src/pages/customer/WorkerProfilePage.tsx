import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Briefcase, CheckCircle, Clock, Loader2 } from 'lucide-react';
import type { Worker } from '../../features/customer/types';
import { workerService } from '../../features/customer/services/workerService';
import { Layout } from '../../features/customer/components/layout/Layout';
import { EmptyState } from '../../features/customer/components/ui';

export const WorkerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock reviews (requested to keep)
  const MOCK_REVIEWS = [
    { id: 1, author: 'Anita S.',   rating: 5, comment: 'Excellent work! Very professional and completed the job ahead of schedule.', date: '2 weeks ago' },
    { id: 2, author: 'Raj P.',     rating: 5, comment: 'Highly recommend. Diagnosed the issue immediately and fixed it cleanly.', date: '1 month ago' },
    { id: 3, author: 'Deepa M.',   rating: 4, comment: 'Good work. Arrived on time and was thorough. Slightly pricey but worth it.', date: '2 months ago' },
  ];

  useEffect(() => {
    const fetchWorker = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await workerService.getWorkerById(id);
        setWorker(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch worker:', err);
        setError(err.response?.data?.message || 'Failed to load worker profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorker();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground font-body">Loading expert profile...</p>
        </div>
      </Layout>
    );
  }

  if (error || !worker) {
    return (
      <Layout>
        <EmptyState
          icon="⚠️"
          title="Worker Profile Not Found"
          description={error || "We couldn't find the profile you're looking for."}
          action={{ label: 'Back to Browse', onClick: () => navigate('/user/home') }}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate('/user/home')}
          className="flex items-center gap-2 text-sm font-label text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </button>

        {/* Profile Hero */}
        <div className="bg-background border border-border rounded-2xl p-6 mb-5">
          <div className="flex items-start gap-5">
            <div className="relative flex-shrink-0">
              <img
                src={worker.user.profileImage ?? `https://i.pravatar.cc/80?u=${worker.id}`}
                alt={worker.user.name}
                className="w-20 h-20 rounded-2xl object-cover"
              />
              <span
                className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-background
                  ${worker.isAvailable ? 'bg-green-500' : 'bg-muted-foreground'}`}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-headline font-bold text-xl text-foreground">{worker.user.name ?? 'Worker'}</h1>
                  <p className="text-sm font-body text-muted-foreground">{worker.skills.slice(0, 2).join(' & ')} Specialist</p>
                </div>
                <span className={`text-xs font-label font-semibold px-2.5 py-1 rounded-full border
                  ${worker.isAvailable
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-surface-container text-muted-foreground border-border'
                  }`}>
                  {worker.isAvailable ? '● Available' : '● Busy'}
                </span>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-5 mt-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-label font-semibold text-sm text-foreground">{worker.ratingAvg.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({worker.ratingCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{worker.experience ?? 0}+ years exp</span>
                </div>
                {worker.serviceRadius && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{worker.serviceRadius}km radius</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* KYC Badge */}
          {worker.kycStatus === 'VERIFIED' && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs font-label font-semibold text-green-700">KYC Verified</span>
              <span className="text-xs text-muted-foreground">— Identity confirmed by SkillLink</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {worker.bio && (
          <div className="p-5 bg-surface-container border border-border rounded-xl mb-5">
            <h2 className="text-xs font-label font-bold text-muted-foreground uppercase tracking-wider mb-2">About</h2>
            <p className="text-sm font-body text-foreground leading-relaxed">{worker.bio}</p>
          </div>
        )}

        {/* Skills */}
        <div className="p-5 bg-background border border-border rounded-xl mb-5">
          <h2 className="text-xs font-label font-bold text-muted-foreground uppercase tracking-wider mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {worker.skills.map(skill => (
              <span key={skill}
                className="px-3 py-1.5 bg-surface-container border border-border rounded-full text-xs font-label font-medium text-foreground">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: Star,        label: 'Avg Rating',  value: `${worker.ratingAvg.toFixed(1)} / 5` },
            { icon: Briefcase,   label: 'Jobs Done',   value: `${worker.ratingCount}+`             },
            { icon: Clock,       label: 'Avg Response', value: '< 2 hrs'                           },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-4 bg-surface-container border border-border rounded-xl text-center">
              <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-2" />
              <p className="font-headline font-bold text-lg text-foreground">{value}</p>
              <p className="text-[10px] font-label text-muted-foreground uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>

        {/* Reviews */}
        <div className="mb-8">
          <h2 className="font-headline font-bold text-base text-foreground mb-4">Recent Reviews</h2>
          <div className="flex flex-col gap-3">
            {MOCK_REVIEWS.map(review => (
              <div key={review.id} className="p-4 bg-background border border-border rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-surface-container border border-border flex items-center justify-center">
                      <span className="text-xs font-label font-bold text-foreground">{review.author[0]}</span>
                    </div>
                    <span className="text-sm font-label font-semibold text-foreground">{review.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">{review.date}</span>
                  </div>
                </div>
                <p className="text-sm font-body text-muted-foreground leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="sticky bottom-6">
          <button
            onClick={() => navigate('/user/create-job', { state: { workerId: worker.id, workerName: worker.user.name } })}
            disabled={!worker.isAvailable}
            className={`w-full py-3.5 text-sm font-label font-semibold rounded-xl transition-all
              ${worker.isAvailable
                ? 'bg-foreground text-background hover:opacity-90 shadow-lg'
                : 'bg-surface-container text-muted-foreground cursor-not-allowed'
              }`}
          >
            {worker.isAvailable ? `Hire ${worker.user.name?.split(' ')[0] ?? 'Worker'}` : 'Currently Unavailable'}
          </button>
        </div>
      </div>
    </Layout>
  );
};