import Link from "next/link";
import Image from "next/image";
import { Award, BookOpen, Heart, ShieldCheck, Star, ArrowRight } from "lucide-react";
import { BookingButton } from "@/components/BookingButton";

export default function AboutJennPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-brand-black py-16 md:py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">About Jennifer Simpson</h1>
                <p className="text-xl text-brand-lavender leading-relaxed">
                  Founder, Tax Strategist, and your partner in financial confidence. 
                  Making taxes simple and stress-free for families and businesses with more than a decade of experience.
                </p>
              </div>
              <div className="lg:w-1/2 relative">
                 <div className="relative aspect-square w-full max-w-md mx-auto rounded-[3rem] overflow-hidden shadow-2xl border-4 border-brand-purple bg-brand-soft-gray">
                    <Image 
                      src="/images/hero-jenn-laptop.png"
                      alt="Jennifer Simpson"
                      fill
                      className="object-cover"
                    />
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold text-brand-black mb-8 border-l-4 border-brand-purple pl-6">Professional Background</h2>
          <div className="space-y-6 text-brand-charcoal/80 text-lg leading-relaxed font-medium">
            <p>
              With over 15 years of professional tax and accounting experience, I've seen it all. 
              But my journey isn't just about spreadsheets and tax codes. As a real estate 
              business owner myself, I understand the unique challenges that come with 
              balancing growth, compliance, and long-term planning.
            </p>
            <p>
              I founded Your Tax Source more than a decade ago with a simple goal: to provide high-level, 
              strategic tax advice in a way that's approachable and easy to understand. 
              I believe that everyone deserves a "plain-English" explanation of their 
              financial situation.
            </p>
          </div>
        </div>
      </section>

      {/* Why Clients Hire Me */}
      <section className="py-24 bg-brand-soft-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl md:text-4xl font-heading font-bold text-brand-black mb-16">Why Clients Hire Me</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Award size={32} />}
              title="Decade of Expertise"
              description="Over 10 years of running Your Tax Source and helping hundreds of clients navigate tax season."
            />
            <FeatureCard 
              icon={<BookOpen size={32} />}
              title="Strategic Insight"
              description="Looking beyond the current filing to help you plan for future growth and tax savings."
            />
            <FeatureCard 
              icon={<ShieldCheck size={32} />}
              title="Reliability"
              description="A consistent partner who stays updated on the latest tax law changes so you don't have to."
            />
            <FeatureCard 
              icon={<Star size={32} />}
              title="Personal Touch"
              description="Treating every return as if it were my own, with attention to detail and care."
            />
          </div>
        </div>
      </section>

      {/* Military Support Section */}
      <section className="py-24 bg-brand-purple text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <Heart className="w-16 h-16 mx-auto mb-8 text-brand-lavender fill-brand-lavender" />
           <h2 className="text-3xl md:text-5xl font-heading font-bold mb-8">Supporting Our Heroes</h2>
           <p className="text-xl text-brand-lavender mb-12 leading-relaxed">
             We are proud to support our veterans and active-duty military. Through our 
             involvement with *Salute The Brave*, we're committed to giving back to 
             those who serve our community and country.
           </p>
        </div>
      </section>

      {/* My Philosophy */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-heading font-bold text-brand-black mb-8">My Philosophy</h2>
          <p className="text-xl text-brand-charcoal/70 italic leading-relaxed">
            "I don't just work for my clients; I work with them. My goal is to empower 
            you with the knowledge and tools you need to take control of your financial 
            future without the stress."
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-brand-black text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-8">Let's Work Together</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <BookingButton className="bg-brand-purple text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-brand-purple/80 transition-all shadow-xl" />
            <Link
              href="/contact"
              className="bg-white text-brand-black px-10 py-5 rounded-2xl font-black text-xl hover:bg-gray-100 transition-all shadow-xl flex items-center justify-center gap-2"
            >
              Contact Me <ArrowRight size={24} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="text-brand-purple mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-brand-black mb-4">{title}</h3>
      <p className="text-brand-charcoal/70 leading-relaxed">{description}</p>
    </div>
  );
}
