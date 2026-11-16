import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Heart, MapPin, Ticket, Check, Trash2, Navigation } from 'lucide-react';
import { api } from '../../lib/api';
import { sampleSpots } from '../../lib/sample';
import { img, timeAgo, titleCase } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';
import { Alert, PageLoader, Reveal, Spinner, StarInput, Stars } from '../../components/ui';
import { SpotCard } from '../../components/Cards';
import NotFound from './NotFound';

function ReviewForm({ spot, existing, onSaved }) {
  const [rating, setRating] = useState(existing?.rating || 0);
  const [comment, setComment] = useState(existing?.comment || '');
  const [state, setState] = useState({ status: 'idle', message: '' });

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return setState({ status: 'error', message: 'Please choose a rating.' });
    setState({ status: 'loading', message: '' });
    try {
      await api('/reviews', { method: 'POST', body: { spot: spot._id, rating, comment } });
      setState({ status: 'done', message: 'Thank you for sharing your experience!' });
      onSaved();
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
    return undefined;
  };

  return (
    <form onSubmit={submit} className="card p-6">
      <p className="font-display text-2xl text-forest-900">{existing ? 'Update your review' : 'Share your experience'}</p>
      <div className="mt-4"><StarInput value={rating} onChange={setRating} /></div>
      <textarea
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What made your visit memorable?"
        className="input mt-4 resize-none"
        maxLength={1500}
      />
      <Alert type={state.status === 'error' ? 'error' : 'success'} className="mt-4">{state.message}</Alert>
      <button className="btn-dark mt-4" disabled={state.status === 'loading'}>
        {state.status === 'loading' && <Spinner />} {existing ? 'Update review' : 'Post review'}
      </button>
    </form>
  );
}

export default function SpotDetail() {
  const { slug } = useParams();
  const { user, isStaff, setUser } = useAuth();
  const [spot, setSpot] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [live, setLive] = useState(false);
  const [status, setStatus] = useState('loading');
  const [activeImg, setActiveImg] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [related, setRelated] = useState([]);

  const load = async () => {
    try {
      const d = await api(`/tourist-spots/${slug}`);
      setSpot(d.data);
      setReviews(d.reviews || []);
      setLive(true);
      setStatus('ready');
      api(`/tourist-spots?category=${d.data.category}&limit=4`)
        .then((r) => setRelated(r.data.filter((s) => s._id !== d.data._id).slice(0, 3)))
        .catch(() => {});
    } catch (err) {
      const fallback = sampleSpots.find((s) => s.slug === slug);
      if (err.status === 0 && fallback) {
        setSpot(fallback);
        setRelated(sampleSpots.filter((s) => s.category === fallback.category && s.slug !== slug).slice(0, 3));
        setStatus('ready');
      } else setStatus('missing');
    }
  };

  useEffect(() => {
    setStatus('loading');
    setActiveImg(0);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (user && spot && live) setFavorited((user.favorites || []).includes(spot._id));
  }, [user, spot, live]);

  const toggleFavorite = async () => {
    const d = await api(`/users/me/favorites/${spot._id}`, { method: 'POST' });
    setFavorited(d.favorited);
    setUser({ ...user, favorites: d.favorites });
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    await api(`/reviews/${id}`, { method: 'DELETE' });
    load();
  };

  if (status === 'loading') return <div className="pt-32"><PageLoader /></div>;
  if (status === 'missing' || !spot) return <NotFound />;

  const images = spot.images?.length ? spot.images : [undefined];
  const myReview = user && reviews.find((r) => r.user?._id === user._id);
  const lat = spot.location?.latitude;
  const lng = spot.location?.longitude;

  return (
    <>
      <section className="grain relative h-[78vh] min-h-[520px] overflow-hidden bg-forest-950 text-white">
        {images.map((src, idx) => (
          <img
            key={src || idx}
            src={img(src, 2200)}
            alt={spot.name}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${idx === activeImg ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/30 to-forest-950/40" />
        <div className="container-x relative flex h-full flex-col justify-end pb-14">
          <Link to="/explore" className="mb-8 inline-flex w-fit items-center gap-2 text-sm text-white/70 hover:text-white">
            <ArrowLeft size={16} /> All destinations
          </Link>
          <p className="eyebrow animate-rise text-gold-300">{titleCase(spot.category)}</p>
          <h1 className="mt-4 max-w-4xl animate-rise font-display text-6xl font-medium leading-[0.95] [animation-delay:120ms] sm:text-8xl">{spot.name}</h1>
          {spot.tagline && <p className="mt-5 max-w-2xl animate-rise text-lg text-white/75 [animation-delay:240ms]">{spot.tagline}</p>}
          <div className="mt-8 flex flex-wrap items-center gap-6">
            {spot.rating > 0 && (
              <span className="flex items-center gap-2 text-sm text-white/80">
                <Stars value={spot.rating} className="text-white" /> {Number(spot.rating).toFixed(1)}
                {spot.reviewCount > 0 && <span className="text-white/50">({spot.reviewCount})</span>}
              </span>
            )}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((src, idx) => (
                  <button
                    key={src}
                    onClick={() => setActiveImg(idx)}
                    className={`h-12 w-16 overflow-hidden rounded-lg ring-2 transition ${idx === activeImg ? 'ring-gold-300' : 'ring-transparent opacity-60 hover:opacity-100'}`}
                    aria-label={`Show photo ${idx + 1}`}
                  >
                    <img src={img(src, 200)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container-x grid gap-14 py-20 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="eyebrow text-gold-600">About this place</p>
            <p className="mt-6 whitespace-pre-line font-display text-2xl leading-relaxed text-forest-900 sm:text-[1.7rem]">{spot.description}</p>
          </Reveal>
          {spot.highlights?.length > 0 && (
            <Reveal className="mt-12">
              <p className="eyebrow text-gold-600">Highlights</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {spot.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-3 rounded-xl border border-forest-900/10 bg-white px-4 py-3 text-sm">
                    <Check size={16} className="text-forest-600" /> {h}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {/* Reviews */}
          <div className="mt-16 border-t border-forest-900/10 pt-12">
            <h2 className="font-display text-4xl text-forest-900">Visitor stories</h2>
            <div className="mt-8 space-y-6">
              {live && user && <ReviewForm key={myReview?._id || 'new'} spot={spot} existing={myReview} onSaved={load} />}
              {live && !user && (
                <div className="card flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
                  <p className="text-forest-900/70">Been here? Sign in to leave a review.</p>
                  <Link to="/login" state={{ from: `/spots/${slug}` }} className="btn-outline !py-2.5">Sign in</Link>
                </div>
              )}
              {reviews.length === 0 ? (
                <p className="text-forest-900/50">No reviews yet — be the first to share your experience.</p>
              ) : (
                reviews.map((r) => (
                  <article key={r._id} className="border-b border-forest-900/10 pb-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-800 font-display text-lg text-cream-50">
                          {r.user?.firstName?.[0] || '?'}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-forest-900">
                            {r.user ? `${r.user.firstName} ${r.user.lastName?.[0] || ''}.` : 'Former member'}
                          </p>
                          <p className="text-xs text-forest-900/50">{timeAgo(r.updatedAt || r.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Stars value={r.rating} className="text-forest-900" />
                        {(isStaff || (user && r.user?._id === user._id)) && (
                          <button onClick={() => deleteReview(r._id)} className="text-forest-900/40 hover:text-red-600" aria-label="Delete review">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                    {r.comment && <p className="mt-3 leading-relaxed text-forest-900/75">{r.comment}</p>}
                  </article>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div className="space-y-5 lg:sticky lg:top-28">
            <div className="card divide-y divide-forest-900/10">
              {[
                { icon: MapPin, label: 'Location', value: spot.location?.address },
                { icon: Clock, label: 'Hours', value: spot.openingHours },
                { icon: Ticket, label: 'Entrance', value: spot.entranceFee },
              ]
                .filter((x) => x.value)
                .map((x) => (
                  <div key={x.label} className="flex gap-4 p-5">
                    <x.icon size={18} className="mt-0.5 shrink-0 text-gold-600" />
                    <div>
                      <p className="label !mb-0.5">{x.label}</p>
                      <p className="text-sm text-forest-900">{x.value}</p>
                    </div>
                  </div>
                ))}
              <div className="flex flex-wrap gap-3 p-5">
                {lat && lng && (
                  <a
                    className="btn-dark flex-1 !py-2.5"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Navigation size={15} /> Directions
                  </a>
                )}
                {live && user && (
                  <button onClick={toggleFavorite} className={`btn flex-1 !py-2.5 border ${favorited ? 'border-red-200 bg-red-50 text-red-700' : 'border-forest-900/20 text-forest-900 hover:border-forest-900'}`}>
                    <Heart size={15} className={favorited ? 'fill-red-600 text-red-600' : ''} /> {favorited ? 'Saved' : 'Save'}
                  </button>
                )}
              </div>
            </div>
            {lat && lng && (
              <div className="card overflow-hidden">
                <iframe
                  title={`Map of ${spot.name}`}
                  className="h-72 w-full"
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.03}%2C${lat - 0.02}%2C${lng + 0.03}%2C${lat + 0.02}&layer=mapnik&marker=${lat}%2C${lng}`}
                />
              </div>
            )}
          </div>
        </aside>
      </section>

      {related.length > 0 && (
        <section className="bg-cream-100 py-20">
          <div className="container-x">
            <h2 className="font-display text-4xl text-forest-900">You may also love</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((s) => <SpotCard key={s._id} spot={s} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
