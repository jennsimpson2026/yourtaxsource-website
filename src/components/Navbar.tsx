import Link from "next/link";
import Image from "next/image";

export const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-brand-purple rounded-md flex items-center justify-center transition-transform group-hover:scale-105">
                 <span className="text-white font-bold text-xl">Y</span>
              </div>
              <span className="font-heading font-bold text-xl text-brand-black hidden md:block">
                Your Tax Source
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <Link href="/services" className="text-brand-charcoal hover:text-brand-purple transition-colors font-medium">Services</Link>
            <Link href="/who-we-help" className="text-brand-charcoal hover:text-brand-purple transition-colors font-medium">Who We Help</Link>
            <Link href="/new-clients" className="text-brand-charcoal hover:text-brand-purple transition-colors font-medium">New Clients</Link>
            <Link href="/pricing" className="text-brand-charcoal hover:text-brand-purple transition-colors font-medium">Pricing</Link>
            <Link href="/about" className="text-brand-charcoal hover:text-brand-purple transition-colors font-medium">About Us</Link>
            <Link href="/about-jenn" className="text-brand-charcoal hover:text-brand-purple transition-colors font-medium">Meet Jenn</Link>
            <Link href="/testimonials" className="text-brand-charcoal hover:text-brand-purple transition-colors font-medium">Testimonials</Link>
            <Link href="/faq" className="text-brand-charcoal hover:text-brand-purple transition-colors font-medium">FAQ</Link>
            <Link href="/contact" className="text-brand-charcoal hover:text-brand-purple transition-colors font-medium">Contact</Link>
            
            <div className="h-6 w-px bg-gray-200 mx-2" />
            
            <Link 
              href="/auth/login" 
              className="text-brand-purple font-bold hover:text-brand-black transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="bg-brand-purple text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#5a3a74] transition-all shadow-sm"
            >
              Start Intake
            </Link>

            <Link href="/" className="ml-2 border-l border-gray-100 pl-6 hidden lg:block">
              <Image 
                src="/images/logo-long.png" 
                alt="Your Tax Source Logo" 
                width={150} 
                height={40} 
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="lg:hidden flex items-center gap-4">
            <Link 
              href="/auth/login" 
              className="text-brand-purple font-bold text-sm"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="bg-brand-purple text-white px-4 py-2 rounded-lg font-bold text-sm"
            >
              Intake
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
