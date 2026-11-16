import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '../../components/SiteLayout';

/** Split-screen layout shared by sign-in and registration. */
export default function AuthShell({ image, quote, title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="grain relative hidden overflow-hidden bg-forest-950 lg:block">
        <img src={image} alt="" className="absolute inset-0 h-full w-full animate-kenburns object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/20 to-forest-950/40" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo light />
          <p className="max-w-md font-display text-4xl italic leading-tight text-cream-50">{quote}</p>
        </div>
      </div>
      <div className="flex flex-col bg-cream-50 px-5 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <div className="lg:hidden"><Logo /></div>
          <Link to="/" className="ml-auto inline-flex items-center gap-2 text-sm text-forest-900/60 hover:text-forest-900">
            <ArrowLeft size={16} /> Back to site
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <h1 className="animate-rise font-display text-5xl font-medium text-forest-900">{title}</h1>
          {subtitle && <p className="mt-3 animate-rise text-forest-900/60 [animation-delay:100ms]">{subtitle}</p>}
          <div className="mt-10 animate-rise [animation-delay:200ms]">{children}</div>
        </div>
      </div>
    </div>
  );
}
