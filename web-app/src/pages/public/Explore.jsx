import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Compass } from 'lucide-react';
import { useApi } from '../../lib/api';
import { sampleSpots } from '../../lib/sample';
import { SPOT_CATEGORIES, titleCase } from '../../lib/format';
import { PageHero, SpotCard } from '../../components/Cards';
import { EmptyState, Reveal, Spinner } from '../../components/ui';

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || 'all';
  const [q, setQ] = useState(params.get('q') || '');
  const [sort, setSort] = useState('popular');

  const { data, loading, live } = useApi(`/tourist-spots?sort=${sort}`, { fallback: sampleSpots });

  const spots = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = data || [];
    if (!live) {
      const by = { popular: (a, b) => b.visitCount - a.visitCount, rating: (a, b) => b.rating - a.rating, name: (a, b) => a.name.localeCompare(b.name) };
      list = [...list].sort(by[sort] || by.popular);
    }
    return list.filter(
      (s) =>
        (category === 'all' || s.category === category) &&
        (!term || [s.name, s.tagline, s.description, s.location?.address].some((f) => f?.toLowerCase().includes(term)))
    );
  }, [data, q, category, sort, live]);

  const presentCats = SPOT_CATEGORIES.filter((c) => (data || []).some((s) => s.category === c));

  const setCategory = (c) => {
    const next = new URLSearchParams(params);
    if (c === 'all') next.delete('category');
    else next.set('category', c);
    setParams(next, { replace: true });
  };

  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title={<>Find your <em className="text-gold-300">quiet place.</em></>}
        image="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=2000&q=80&auto=format&fit=crop"
      >
        From mirror-still lakes to wind-swept ridges, every corner of Don Carlos has its own kind of calm.
      </PageHero>

      <section className="sticky top-[69px] z-30 border-b border-forest-900/10 bg-cream-50/90 backdrop-blur-xl">
        <div className="container-x flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            {['all', ...presentCats].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                  category === c ? 'bg-forest-900 text-cream-50' : 'text-forest-900/65 hover:bg-forest-900/5 hover:text-forest-900'
                }`}
              >
                {c === 'all' ? 'All' : titleCase(c)}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <label className="relative flex-1 lg:w-72">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest-900/40" size={16} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search destinations" className="input !rounded-full !py-2.5 pl-11" aria-label="Search destinations" />
            </label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input !w-auto !rounded-full !py-2.5" aria-label="Sort">
              <option value="popular">Most visited</option>
              <option value="rating">Top rated</option>
              <option value="name">A–Z</option>
            </select>
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <p className="mb-8 flex items-center gap-2 text-sm text-forest-900/60">
          {loading && <Spinner />} {spots.length} destination{spots.length === 1 ? '' : 's'}
        </p>
        {spots.length === 0 ? (
          <EmptyState icon={Compass} title="Nothing here — yet">Try a different search or category.</EmptyState>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {spots.map((s, idx) => (
              <Reveal key={s._id} delay={(idx % 3) * 100}>
                <SpotCard spot={s} tall />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
