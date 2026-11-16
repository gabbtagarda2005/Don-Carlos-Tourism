import { useState } from 'react';
import { api } from '../lib/api';
import { BUSINESS_CATEGORIES, SPOT_CATEGORIES, businessLabel, linesToArray, titleCase } from '../lib/format';
import { Alert, Spinner } from './ui';

function Field({ label, children, hint, className = '' }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-forest-900/45">{hint}</p>}
    </div>
  );
}

function useSubmit(onSaved) {
  const [state, setState] = useState({ loading: false, error: '' });
  const run = async (fn) => {
    setState({ loading: true, error: '' });
    try {
      const res = await fn();
      setState({ loading: false, error: '' });
      onSaved(res?.data);
    } catch (err) {
      setState({ loading: false, error: err.message });
    }
  };
  return [state, run];
}

function Actions({ state, onCancel, label }) {
  return (
    <div className="sm:col-span-2">
      <Alert className="mb-4">{state.error}</Alert>
      <div className="flex justify-end gap-3">
        {onCancel && <button type="button" onClick={onCancel} className="btn-outline">Cancel</button>}
        <button className="btn-dark" disabled={state.loading}>{state.loading && <Spinner />} {label}</button>
      </div>
    </div>
  );
}

function ImagePreview({ urls }) {
  if (!urls.length) return null;
  return (
    <div className="mt-2 flex gap-2 overflow-x-auto">
      {urls.slice(0, 6).map((u) => (
        <img key={u} src={u} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover ring-1 ring-forest-900/10" onError={(e) => { e.currentTarget.style.opacity = 0.2; }} />
      ))}
    </div>
  );
}

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export function SpotForm({ spot, onSaved, onCancel }) {
  const [f, setF] = useState({
    name: spot?.name || '',
    tagline: spot?.tagline || '',
    category: spot?.category || 'nature',
    description: spot?.description || '',
    address: spot?.location?.address || '',
    latitude: spot?.location?.latitude ?? '',
    longitude: spot?.location?.longitude ?? '',
    images: (spot?.images || []).join('\n'),
    highlights: (spot?.highlights || []).join('\n'),
    entranceFee: spot?.entranceFee || '',
    openingHours: spot?.openingHours || '',
    featured: spot?.featured || false,
    isActive: spot?.isActive ?? true,
  });
  const [state, run] = useSubmit(onSaved);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const body = {
      name: f.name,
      tagline: f.tagline,
      category: f.category,
      description: f.description,
      location: {
        address: f.address,
        latitude: f.latitude === '' ? undefined : Number(f.latitude),
        longitude: f.longitude === '' ? undefined : Number(f.longitude),
      },
      images: linesToArray(f.images),
      highlights: linesToArray(f.highlights),
      entranceFee: f.entranceFee,
      openingHours: f.openingHours,
      featured: f.featured,
      isActive: f.isActive,
    };
    run(() => api(spot ? `/tourist-spots/${spot._id}` : '/tourist-spots', { method: spot ? 'PUT' : 'POST', body }));
  };

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
      <Field label="Name"><input required className="input" value={f.name} onChange={set('name')} /></Field>
      <Field label="Category">
        <select className="input" value={f.category} onChange={set('category')}>
          {SPOT_CATEGORIES.map((c) => <option key={c} value={c}>{titleCase(c)}</option>)}
        </select>
      </Field>
      <Field label="Tagline" className="sm:col-span-2"><input className="input" value={f.tagline} onChange={set('tagline')} maxLength={160} placeholder="One evocative line" /></Field>
      <Field label="Description" className="sm:col-span-2"><textarea rows={5} className="input" value={f.description} onChange={set('description')} /></Field>
      <Field label="Address" className="sm:col-span-2"><input className="input" value={f.address} onChange={set('address')} /></Field>
      <Field label="Latitude"><input type="number" step="any" className="input" value={f.latitude} onChange={set('latitude')} /></Field>
      <Field label="Longitude"><input type="number" step="any" className="input" value={f.longitude} onChange={set('longitude')} /></Field>
      <Field label="Entrance fee"><input className="input" value={f.entranceFee} onChange={set('entranceFee')} placeholder="Free / ₱20" /></Field>
      <Field label="Opening hours"><input className="input" value={f.openingHours} onChange={set('openingHours')} placeholder="Daily, 6 AM – 5 PM" /></Field>
      <Field label="Image URLs" hint="One per line. The first image is the cover." className="sm:col-span-2">
        <textarea rows={3} className="input font-mono text-xs" value={f.images} onChange={set('images')} placeholder="https://…" />
        <ImagePreview urls={linesToArray(f.images)} />
      </Field>
      <Field label="Highlights" hint="One per line" className="sm:col-span-2"><textarea rows={3} className="input" value={f.highlights} onChange={set('highlights')} /></Field>
      <div className="flex flex-wrap gap-6 sm:col-span-2">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.featured} onChange={set('featured')} className="h-4 w-4 accent-forest-800" /> Featured on homepage</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.isActive} onChange={set('isActive')} className="h-4 w-4 accent-forest-800" /> Published</label>
      </div>
      <Actions state={state} onCancel={onCancel} label={spot ? 'Save changes' : 'Create destination'} />
    </form>
  );
}

export function EventForm({ event, onSaved, onCancel }) {
  const [f, setF] = useState({
    title: event?.title || '',
    category: event?.category || 'Festival',
    date: toDateInput(event?.date),
    endDate: toDateInput(event?.endDate),
    location: event?.location || '',
    description: event?.description || '',
    images: (event?.images || []).join('\n'),
    featured: event?.featured || false,
    isActive: event?.isActive ?? true,
  });
  const [state, run] = useSubmit(onSaved);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const body = { ...f, images: linesToArray(f.images), endDate: f.endDate || null };
    run(() => api(event ? `/events/${event._id}` : '/events', { method: event ? 'PUT' : 'POST', body }));
  };

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
      <Field label="Title" className="sm:col-span-2"><input required className="input" value={f.title} onChange={set('title')} /></Field>
      <Field label="Start date"><input required type="date" className="input" value={f.date} onChange={set('date')} /></Field>
      <Field label="End date (optional)"><input type="date" min={f.date} className="input" value={f.endDate} onChange={set('endDate')} /></Field>
      <Field label="Category">
        <input className="input" list="event-cats" value={f.category} onChange={set('category')} />
        <datalist id="event-cats">{['Festival', 'Sports', 'Nature', 'Culture', 'Food', 'Community'].map((c) => <option key={c} value={c} />)}</datalist>
      </Field>
      <Field label="Location"><input className="input" value={f.location} onChange={set('location')} /></Field>
      <Field label="Description" className="sm:col-span-2"><textarea rows={4} className="input" value={f.description} onChange={set('description')} /></Field>
      <Field label="Image URLs" hint="One per line" className="sm:col-span-2">
        <textarea rows={2} className="input font-mono text-xs" value={f.images} onChange={set('images')} />
        <ImagePreview urls={linesToArray(f.images)} />
      </Field>
      <div className="flex flex-wrap gap-6 sm:col-span-2">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.featured} onChange={set('featured')} className="h-4 w-4 accent-forest-800" /> Featured</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.isActive} onChange={set('isActive')} className="h-4 w-4 accent-forest-800" /> Published</label>
      </div>
      <Actions state={state} onCancel={onCancel} label={event ? 'Save changes' : 'Create event'} />
    </form>
  );
}

export function BusinessForm({ business, onSaved, onCancel }) {
  const [f, setF] = useState({
    name: business?.name || '',
    category: business?.category || 'restaurant',
    description: business?.description || '',
    priceRange: business?.priceRange || '',
    phone: business?.contact?.phone || '',
    email: business?.contact?.email || '',
    address: business?.contact?.address || '',
    website: business?.contact?.website || '',
    images: (business?.images || []).join('\n'),
  });
  const [state, run] = useSubmit(onSaved);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const body = {
      name: f.name,
      category: f.category,
      description: f.description,
      priceRange: f.priceRange,
      contact: { phone: f.phone, email: f.email, address: f.address, website: f.website },
      images: linesToArray(f.images),
    };
    run(() => api(business ? `/businesses/${business._id}` : '/businesses', { method: business ? 'PUT' : 'POST', body }));
  };

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
      <Field label="Business name"><input required className="input" value={f.name} onChange={set('name')} /></Field>
      <Field label="Category">
        <select className="input" value={f.category} onChange={set('category')}>
          {BUSINESS_CATEGORIES.map((c) => <option key={c} value={c}>{businessLabel(c)}</option>)}
        </select>
      </Field>
      <Field label="Description" className="sm:col-span-2"><textarea rows={4} className="input" value={f.description} onChange={set('description')} /></Field>
      <Field label="Price range"><input className="input" value={f.priceRange} onChange={set('priceRange')} placeholder="₱1,500 – ₱3,000 / night" /></Field>
      <Field label="Phone"><input className="input" value={f.phone} onChange={set('phone')} /></Field>
      <Field label="Email"><input type="email" className="input" value={f.email} onChange={set('email')} /></Field>
      <Field label="Website"><input type="url" className="input" value={f.website} onChange={set('website')} placeholder="https://" /></Field>
      <Field label="Address" className="sm:col-span-2"><input className="input" value={f.address} onChange={set('address')} /></Field>
      <Field label="Image URLs" hint="One per line. Paste links to photos hosted online." className="sm:col-span-2">
        <textarea rows={2} className="input font-mono text-xs" value={f.images} onChange={set('images')} />
        <ImagePreview urls={linesToArray(f.images)} />
      </Field>
      <Actions state={state} onCancel={onCancel} label={business ? 'Save changes' : 'Submit listing'} />
    </form>
  );
}
