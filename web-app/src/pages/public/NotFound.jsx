import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="grain relative flex min-h-[80vh] items-center overflow-hidden bg-forest-950 text-cream-50">
      <img
        src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=2000&q=70&auto=format&fit=crop"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      />
      <div className="container-x relative py-40">
        <p className="eyebrow text-gold-300">404 · Lost in the mist</p>
        <h1 className="mt-5 max-w-3xl font-display text-6xl leading-none sm:text-8xl">This trail doesn’t lead anywhere.</h1>
        <Link to="/" className="btn-gold mt-10"><ArrowLeft size={16} /> Back to the beginning</Link>
      </div>
    </section>
  );
}
