import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-purple rounded-md flex items-center justify-center">
                 <span className="text-white font-bold text-lg">Y</span>
              </div>
              <span className="font-heading font-bold text-lg text-brand-black">
                Your Tax Source
              </span>
            </div>
            <p className="text-brand-charcoal/70 max-w-sm mb-6">
              Making taxes simple and stress-free for families and businesses nationwide. Proudly rooted in Belmont, NC since 2013.
            </p>
            <p className="text-sm text-brand-charcoal/50">
              © 2024 Your Tax Source. All rights reserved.
            </p>
          </div>
          
          <div>
            <h3 className="font-heading font-bold text-brand-black mb-4 uppercase text-sm tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/services" className="text-brand-charcoal/70 hover:text-brand-purple transition-colors">Services</Link></li>
              <li><Link href="/pricing" className="text-brand-charcoal/70 hover:text-brand-purple transition-colors">Pricing</Link></li>
              <li><Link href="/about" className="text-brand-charcoal/70 hover:text-brand-purple transition-colors">About Us</Link></li>
              <li><Link href="/testimonials" className="text-brand-charcoal/70 hover:text-brand-purple transition-colors">Testimonials</Link></li>
              <li><Link href="/faq" className="text-brand-charcoal/70 hover:text-brand-purple transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-brand-charcoal/70 hover:text-brand-purple transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-bold text-brand-black mb-4 uppercase text-sm tracking-wider">Contact</h3>
            <ul className="space-y-2 text-brand-charcoal/70">
              <li>Serving Clients Nationwide</li>
              <li>Belmont, NC Office</li>
              <li>(555) 123-4567</li>
              <li>hello@yourtaxsource.com</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
