import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { CATEGORIES } from '../../shared/constants/categories';
import type { Worker } from '../../features/customer/types';
import { WorkerCard } from '../../features/customer/worker/Workercard';
import { CategoryPill, SectionHeader, PageHeader, EmptyState } from '../../features/customer/components/ui';
import { Layout } from '../../features/customer/components/layout/Layout';
import { useAuth } from "../../app/context/useAuth";
import { workerService } from '../../features/customer/services/workerService';
import { productsApi } from "@/features/products/api/productsApi";
import type { Product } from "@/features/products/types";

export const UserHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('Electricians');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [workersData, productsRes] = await Promise.all([
          workerService.getAllWorkers(),
          productsApi.findAll({ limit: 4 })
        ]);
        
        setWorkers(workersData);
        
        let items: Product[] = [];
        const res = productsRes as any;
        if (Array.isArray(res)) {
          items = res;
        } else if (res && typeof res === 'object') {
          if (Array.isArray(res.items)) items = res.items;
          else if (res.data && Array.isArray(res.data.items)) items = res.data.items;
          else if (res.data && Array.isArray(res.data)) items = res.data;
        }
        setProducts(items);

        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!user) return null;

  const filteredWorkers = workers
    .filter(w => 
      w.skills.some(skill => {
        const s = skill.toLowerCase();
        const c = activeCategory.toLowerCase();
        // Match "Electrician" skill to "Electricians" category, and vice-versa
        return s.includes(c) || c.includes(s) || (c.endsWith('s') && s.includes(c.slice(0, -1)));
      })
    )
    .slice(0, 4);

  const handleHire = (worker: Worker) => {
    navigate(`/user/worker/${worker.id}`);
  };

  const handleViewProfile = (worker: Worker) => {
    navigate(`/user/worker/${worker.id}`);
  };

  return (
    <Layout>
      {/* ── Page Header ── */}
      <PageHeader
        title="Find your local expert."
        subtitle="Connect with verified professionals and local hardware suppliers within your immediate vicinity."
        action={{
          label: 'Create Request',
          onClick: () => navigate('/user/create-job')
        }}
      />

      {/* ── Category Pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <CategoryPill
            key={cat.label}
            label={cat.label}
            icon={cat.icon}
            active={activeCategory === cat.label}
            onClick={() => setActiveCategory(cat.label)}
          />
        ))}
      </div>

      {/* ── Nearby Experts ── */}
      <div className="mb-12">
        <SectionHeader
          title="Nearby Experts"
          action={{ label: 'View All', onClick: () => navigate('/user/browse-workers') }}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-surface-container border border-border border-dashed rounded-2xl">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm font-body text-muted-foreground">Finding experts in your area...</p>
            </div>
          ) : error ? (
            <div className="col-span-full">
              <EmptyState
                icon="⚠️"
                title="Something went wrong"
                description={error}
                action={{ label: 'Try Again', onClick: () => window.location.reload() }}
              />
            </div>
          ) : filteredWorkers.length > 0 ? (
            filteredWorkers.map((worker, i) => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                onHire={handleHire}
                onViewProfile={handleViewProfile}
                distanceMiles={i === 0 ? 0.8 : 1.2}
                startsFrom={i === 0 ? 45 : 55}
              />
            ))
          ) : (
            <div className="col-span-full">
              <EmptyState
                icon="🔍"
                title="No experts found"
                description={`No ${activeCategory} are available in the database at the moment. Try another category or check back later.`}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Popular at Local Shops ── */}
      <div className="mb-8">
        <SectionHeader
          title="Popular at Local Shops"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <div key={product.id} onClick={() => navigate('/user/products')}
              className="bg-background border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-outline transition-all cursor-pointer group">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300&h=200&fit=crop'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.stockQuantity < 10 && (
                  <span className={`absolute top-2 left-2 text-[10px] font-label font-bold px-2 py-0.5 rounded shadow-sm bg-red-500 text-white`}>
                    Low Stock
                  </span>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-label font-semibold text-sm text-foreground line-clamp-1">{product.name}</h4>
                <p className="text-xs font-body text-muted-foreground mb-3">{product.organisation?.businessName || 'Local Shop'}</p>
                <div className="flex items-center justify-between">
                  <span className="font-headline font-bold text-sm text-foreground">
                    ₹{product.price.toLocaleString()}
                  </span>
                  <button className="w-8 h-8 border border-border rounded-lg flex items-center justify-center hover:bg-foreground hover:text-background hover:border-foreground transition-all">
                    <span className="text-sm">🛒</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && !loading && (
            <div className="col-span-4 py-8 text-center text-muted-foreground text-sm font-body">
              No products available right now.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
