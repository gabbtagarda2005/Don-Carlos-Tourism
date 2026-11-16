import { useEffect, useRef, useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';

/** Fades/slides children in when scrolled into view. */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.01, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Animated number that counts up when visible. */
export function CountUp({ value = 0, duration = 1600, suffix = '' }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let raf;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t) => {
        const p = Math.min((t - start) / duration, 1);
        setN(Math.round(value * (1 - (1 - p) ** 3)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);
  return (
    <span ref={ref}>
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

export function Stars({ value = 0, size = 14, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(value) ? 'fill-gold-400 text-gold-400' : 'fill-transparent text-current opacity-30'}
        />
      ))}
    </span>
  );
}

export function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onClick={() => onChange(i)}
          className="p-0.5 transition-transform hover:scale-110"
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
        >
          <Star size={26} className={i <= (hover || value) ? 'fill-gold-400 text-gold-400' : 'text-forest-900/25'} />
        </button>
      ))}
    </div>
  );
}

export function Spinner({ className = '' }) {
  return <Loader2 className={`animate-spin ${className}`} size={18} />;
}

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-forest-700">
      <Spinner className="h-6 w-6" />
    </div>
  );
}

export function Alert({ type = 'error', children, className = '' }) {
  if (!children) return null;
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-forest-200 bg-forest-50 text-forest-800',
    info: 'border-gold-300 bg-cream-100 text-forest-900',
  };
  return <div className={`rounded-xl border px-4 py-3 text-sm ${styles[type]} ${className}`}>{children}</div>;
}

export function Modal({ open, title, onClose, children, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-forest-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-cream-50 shadow-2xl sm:rounded-3xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'} animate-rise`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-forest-900/10 bg-cream-50/95 px-6 py-4 backdrop-blur">
          <h2 className="text-2xl font-semibold text-forest-900">{title}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-forest-900/60 hover:bg-forest-900/5 hover:text-forest-900" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-forest-900/15 px-6 py-16 text-center">
      {Icon && <Icon className="mb-4 text-forest-400" size={32} strokeWidth={1.5} />}
      <p className="font-display text-2xl text-forest-900">{title}</p>
      {children && <div className="mt-2 max-w-sm text-sm text-forest-900/60">{children}</div>}
    </div>
  );
}

/** Image that fades in once loaded. */
export function FadeImg({ className = '', alt = '', ...props }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={`${className} transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      {...props}
    />
  );
}
