import { Link, useSearchParams } from 'react-router-dom';
import { Store, ArrowRight } from 'lucide-react';
import { useApi } from '../../lib/api';
import { sampleBusinesses } from '../../lib/sample';
import { BUSINESS_CATEGORIES, businessLabel } from '../../lib/format';
import { PageHero, BusinessCard } from '../../components/Cards';
import { EmptyState, Reveal } from '../../components/ui';

export default function Stays() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || 'all';
  const { data } = useApi('/businesses', { fallback: sampleBusinesses });
  const all = data || [];
  const list = all.filter((b) => category === 'all' || b.category === category);
  const present = BUSINESS_CATEGORIES.filter((c) => all.some((b) => b.category === c));

  return (
    <>
      <PageHero
        eyebrow="Stay & dine"
        title={<>Warm beds, <em className="text-gold-300">warmer welcomes.</em></>}
        image="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=2000&q=80&auto=format&fit=crop"
      >
        Lakeside inns, valley resorts, farm-to-table kitchens and local guides — all accredited by the Don Carlos Tourism Office.
      </PageHero>
      <section className="container-x py-16">
        <div className="no-scrollbar mb-10 flex gap-2 overflow-x-auto">
          {['all', ...present].map((c) => (
            <button
              key={c}
              onClick={() => setParams(c === 'all' ? {} : { category: c }, { replace: true })}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                category === c ? 'bg-forest-900 text-cream-50' : 'border border-forest-900/15 text-forest-900/70 hover:border-forest-900'
              }`}
            >
              {c === 'all' ? 'All' : businessLabel(c)}
            </button>
          ))}
        </div>
        {list.length === 0 ? (
          <EmptyState icon={Store} title="No listings in this category yet" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((b, idx) => (
              <Reveal key={b._id} delay={(idx % 3) * 100}><BusinessCard business={b} /></Reveal>
            ))}
          </div>
        )}

        <Reveal className="mt-20 flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-forest-900 p-10 text-cream-50 sm:flex-row sm:items-center sm:p-14">
          <div>
            <p className="eyebrow text-gold-300">For local businesses</p>
            <p className="mt-3 max-w-xl font-display text-4xl leading-tight">Run an inn, eatery or tour in Don Carlos? Get listed for free.</p>
          </div>
          <Link to="/register?role=business_owner" className="btn-gold shrink-0">Become a partner <ArrowRight size={16} /></Link>
        </Reveal>
      </section>
    </>
  );
}
