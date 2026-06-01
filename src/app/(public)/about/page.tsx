import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Award, BookOpen, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-brand-purple py-16 md:py-32 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom duration-700">
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-8 leading-tight">
              A Decade of Putting <span className="text-brand-lavender italic">You</span> First.
            </h1>
            <p className="text-xl text-brand-lavender leading-relaxed">
              Your trusted partner for nationwide tax preparation and advisory, 
              proudly rooted in Belmont, NC since 2013. We're on a mission to make 
              taxes simple, transparent, and accessible for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl border-8 border-brand-soft-gray">
              <Image
                src="/images/belmont-office.png"
                alt="Your Tax Source Office"
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-heading font-bold text-brand-black mb-8 border-l-4 border-brand-purple pl-6 uppercase tracking-tight">Our Story</h2>
              <div className="space-y-6 text-brand-charcoal/80 text-lg leading-relaxed font-medium">
                <p>
                  Founded in 2013, Your Tax Source was born out of a simple observation: 
                  the tax world is unnecessarily complicated. Most people dread tax season 
                  not because of the math, but because of the confusion.
                </p>
                <p>
                  We decided to change that. While we started in the heart of Belmont, 
                  North Carolina, we've grown into a digital-first firm that serves clients 
                  in all 50 states. We combine big-firm expertise with a 
                  neighborhood feel, regardless of where you're located.
                </p>
                <p>
                  Our team doesn't just process numbers; we build relationships. 
                  We're here to help you understand your financial picture so you can 
                  make confident decisions for your future.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jennifer Simpson Bio Section */}
      <section className="py-24 bg-brand-soft-gray border-y border-gray-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-20">
               <div className="lg:w-2/5 relative">
                  <div className="absolute inset-0 bg-brand-purple rounded-[3rem] rotate-3 scale-95 opacity-10 blur-xl"></div>
                  <div className="relative aspect-square w-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                        <Image 
                          src="/images/jenns-profile-pic.jpg"
                          alt="Jennifer Simpson"
                          fill
                          className="object-cover"
                        />
                  </div>
               </div>
               <div className="lg:w-3/5">
                  <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-black mb-2">Meet Jennifer Simpson</h2>
                  <p className="text-brand-purple font-bold uppercase tracking-widest text-sm mb-8">Founder & Lead Advisor</p>
                  
                  <div className="space-y-6 text-brand-charcoal/80 text-lg leading-relaxed font-medium">
                     <p>
                        Jennifer Simpson founded Your Tax Source in 2013 with a vision to bridge the gap between 
                        complex tax laws and the real-world needs of families and small businesses. 
                        With a deep commitment to clarity and a "plain-English" approach, she has 
                        personally helped hundreds of clients navigate their financial journeys.
                     </p>
                     <p>
                        Her expertise spans across individual tax strategy, small business bookkeeping, 
                        and fractional controller services. Jennifer believes that technology should 
                        enhance the human experience, not replace it, which is why Your Tax Source 
                        utilizes a secure, digital-first platform while maintaining personalized, 
                        one-on-one relationships with every client.
                     </p>
                  </div>

                  <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <Award className="text-brand-purple" size={20} />
                        <span className="text-sm font-bold text-brand-black">10+ Years Expertise</span>
                     </div>
                     <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <BookOpen className="text-brand-purple" size={20} />
                        <span className="text-sm font-bold text-brand-black">IRS Registered Provider</span>
                     </div>
                     <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <Heart className="text-brand-purple" size={20} />
                        <span className="text-sm font-bold text-brand-black">Belmont Community Leader</span>
                     </div>
                     <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <CheckCircle2 className="text-brand-purple" size={20} />
                        <span className="text-sm font-bold text-brand-black">Client-First Advocate</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-black mb-16">The Values That Drive Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValueCard
              title="Clarity Over Jargon"
              description="If we can't explain it simply, we don't understand it well enough. We're here to make things clear, not confusing."
            />
            <ValueCard
              title="Absolute Security"
              description="Your financial data is sensitive. We use bank-grade encryption and secure protocols to keep your information safe."
            />
            <ValueCard
              title="Digital-First, Human-Centered"
              description="While we use cutting-edge technology to serve you anywhere in the country, we never lose the human touch."
            />
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 bg-brand-black text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-purple/5"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-8">
            Ready to work with a tax pro who actually listens?
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contact"
              className="inline-block bg-brand-purple text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-black transition-all shadow-lg"
            >
              Get in Touch Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ValueCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-brand-cloud p-10 rounded-[2.5rem] border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 group">
      <div className="w-12 h-1 bg-brand-orange mb-6 mx-auto group-hover:w-20 transition-all duration-500"></div>
      <h3 className="text-brand-navy uppercase text-sm font-black tracking-widest mb-4">{title}</h3>
      <p className="text-brand-charcoal/70 leading-relaxed font-medium">{description}</p>
    </div>
  );
}
