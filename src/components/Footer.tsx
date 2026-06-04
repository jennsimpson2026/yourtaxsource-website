import Link from "next/link";
import Image from "next/image";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Link href="/" className="group">
                <Image 
                  src="/images/logo-long.png" 
                  alt="Your Tax Source" 
                  width={720} 
                  height={240} 
                  className="h-24 md:h-38 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </Link>
            </div>
            <p className="text-brand-charcoal/70 max-w-sm mb-6">
              Making taxes simple and stress-free for families and businesses nationwide. Proudly supporting our clients with more than a decade of experience.
            </p>
            <p className="text-sm text-brand-charcoal/50">
              © {currentYear} Your Tax Source. All rights reserved.
            </p>
          </div>
          
          <div>
            <h3 className="font-heading font-bold text-brand-black mb-4 uppercase text-sm tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/services" className="text-brand-charcoal/70 hover:text-brand-purple transition-colors">Services</Link></li>
              <li><Link href="/who-we-help" className="text-brand-charcoal/70 hover:text-brand-purple transition-colors">Who We Help</Link></li>
              <li><Link href="/new-clients" className="text-brand-charcoal/70 hover:text-brand-purple transition-colors font-bold">New Clients</Link></li>
              <li><Link href="/pricing" className="text-brand-charcoal/70 hover:text-brand-purple transition-colors">Pricing</Link></li>
              <li><Link href="/about" className="text-brand-charcoal/70 hover:text-brand-purple transition-colors">About Us</Link></li>
              <li><Link href="/about-jenn" className="text-brand-charcoal/70 hover:text-brand-purple transition-colors">Meet Jenn</Link></li>
              <li><Link href="/testimonials" className="text-brand-charcoal/70 hover:text-brand-purple transition-colors">Testimonials</Link></li>
              <li><Link href="/faq" className="text-brand-charcoal/70 hover:text-brand-purple transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-brand-charcoal/70 hover:text-brand-purple transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-bold text-brand-black mb-4 uppercase text-sm tracking-wider">Contact</h3>
            <ul className="space-y-2 text-brand-charcoal/70 text-sm font-medium">
              <li>100 1/2 S Main St</li>
              <li>Belmont, NC 28012</li>
              <li className="pt-2 font-bold text-brand-purple">(980) 285-1495</li>
              <li>jsimpson@yourtaxsource.com</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
