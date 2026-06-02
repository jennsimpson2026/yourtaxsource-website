import Link from "next/link";
import Image from "next/image";

export const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-3 group">
              <Image 
                src="/images/logo-long.png" 
                alt="Your Tax Source Logo" 
                width={180} 
                height={48} 
                className="h-12 w-auto object-contain"
                priority
              />
              <span className="sr-only">Your Tax Source</span>
            </Link>
          </div>

          <div className="hidden xl:flex items-center gap-6">
            <Link href="/services" className="text-brand-charcoal hover:text-brand-purple transition-colors font-semibold text-sm uppercase tracking-wider">Services</Link>
            <Link href="/pricing" className="text-brand-charcoal hover:text-brand-purple transition-colors font-semibold text-sm uppercase tracking-wider">Pricing</Link>
            <Link href="/about" className="text-brand-charcoal hover:text-brand-purple transition-colors font-semibold text-sm uppercase tracking-wider">About</Link>
            <Link href="/resources" className="text-brand-charcoal hover:text-brand-purple transition-colors font-semibold text-sm uppercase tracking-wider">Resources</Link>
            <Link href="/faq" className="text-brand-charcoal hover:text-brand-purple transition-colors font-semibold text-sm uppercase tracking-wider">FAQ</Link>
            <Link href="/contact" className="text-brand-charcoal hover:text-brand-purple transition-colors font-semibold text-sm uppercase tracking-wider">Contact</Link>
            
            <div className="h-6 w-px bg-gray-200 mx-2" />
            
            <Link 
              href="/portal" 
              className="bg-brand-black text-white px-5 py-2.5 rounded-lg font-bold hover:bg-brand-purple transition-all shadow-md flex items-center gap-2 text-sm"
            >
              Client Portal
            </Link>
            
            <Link 
              href="/auth/login" 
              className="text-brand-purple font-bold hover:text-brand-black transition-colors text-sm"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="bg-brand-purple text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#5a3a74] transition-all shadow-sm text-sm"
            >
              Start Intake
            </Link>
          </div>

          <div className="xl:hidden flex items-center gap-3">
            <Link 
              href="/portal" 
              className="bg-brand-black text-white px-3 py-1.5 rounded-lg font-bold text-xs"
            >
              Portal
            </Link>
            <Link
              href="/auth/signup"
              className="bg-brand-purple text-white px-3 py-1.5 rounded-lg font-bold text-xs"
            >
              Intake
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
