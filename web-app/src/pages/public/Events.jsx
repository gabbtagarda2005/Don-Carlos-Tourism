import { CalendarX } from 'lucide-react';
import { useApi } from '../../lib/api';
import { sampleEvents } from '../../lib/sample';
import { PageHero, EventRow } from '../../components/Cards';
import { EmptyState, Reveal, Spinner } from '../../components/ui';

export default function Events() {
  const { data, loading } = useApi('/events?upcoming=true', { fallback: sampleEvents });
  const events = data || [];

  // Group by "Month Year"
  const groups = events.reduce((acc, e) => {
    const key = new Date(e.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    (acc[key] ||= []).push(e);
    return acc;
  }, {});

  return (
    <>
      <PageHero
        eyebrow="Festivals & events"
        title={<>The town, <em className="text-gold-300">in celebration.</em></>}
        image="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=2000&q=80&auto=format&fit=crop"
      >
        Fiestas, fairs, fun runs and starlit gatherings. Here’s what’s coming up in Don Carlos.
      </PageHero>
      <section className="container-x py-20">
        {loading && events.length === 0 && <Spinner />}
        {!loading && events.length === 0 ? (
          <EmptyState icon={CalendarX} title="No upcoming events">Check back soon — new events are announced regularly.</EmptyState>
        ) : (
          Object.entries(groups).map(([month, list]) => (
            <div key={month} className="mb-16 grid gap-8 lg:grid-cols-12">
              <Reveal className="lg:col-span-3">
                <h2 className="font-display text-4xl text-forest-900 lg:sticky lg:top-28">{month}</h2>
              </Reveal>
              <div className="border-t border-forest-900/10 lg:col-span-9">
                {list.map((e) => (
                  <Reveal key={e._id}><EventRow event={e} /></Reveal>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </>
  );
}
