import Link from "next/link";
import { Star, Quote, Heart, Shield, Clock, MessageSquare, ThumbsUp, Sparkles } from "lucide-react";

export default function TestimonialsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-brand-purple py-16 md:py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">Client Reviews & Testimonials</h1>
          <p className="text-xl text-brand-lavender max-w-2xl mx-auto leading-relaxed">
            Real stories from the families and businesses we serve. 
            Your success is our greatest recommendation.
          </p>
        </div>
      </section>

      {/* Featured Review */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-brand-soft-gray p-8 md:p-16 rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
            <Quote className="absolute top-10 right-10 text-brand-purple/10 w-32 h-32" />
            <div className="relative z-10">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="fill-brand-purple text-brand-purple" size={24} />
                ))}
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-brand-black mb-8 leading-relaxed italic">
                "Working with Your Tax Source has been a game-changer for our family. The 'plain-English' 
                approach made everything so clear, and for the first time in years, we actually 
                felt confident about our filing. They truly treat you like a neighbor!"
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-purple rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  SR
                </div>
                <div>
                  <p className="font-bold text-brand-black text-lg">Savanna & Robert A.</p>
                  <p className="text-brand-purple font-semibold uppercase tracking-widest text-xs">Long-time Clients</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Clients Appreciate Most */}
      <section className="py-24 bg-brand-purple/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-black mb-4">What Clients Appreciate Most</h2>
            <div className="w-20 h-1.5 bg-brand-purple mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AppreciationCard 
              icon={<Shield className="text-brand-purple" />}
              title="Absolute Security"
              description="Knowing that sensitive financial data is protected by bank-grade encryption in the secure portal."
            />
            <AppreciationCard 
              icon={<MessageSquare className="text-brand-purple" />}
              title="Plain-English Clarity"
              description="Complex tax laws explained in simple terms, ensuring clients always understand their position."
            />
            <AppreciationCard 
              icon={<Clock className="text-brand-purple" />}
              title="Timely Responsiveness"
              description="Quick turnarounds and proactive updates throughout the entire engagement process."
            />
            <AppreciationCard 
              icon={<Heart className="text-brand-purple" />}
              title="Personalized Attention"
              description="Never feeling like a number; every client receives dedicated, one-on-one advisory."
            />
            <AppreciationCard 
              icon={<ThumbsUp className="text-brand-purple" />}
              title="Stress-Free Process"
              description="A digital-first workflow that eliminates the typical 'tax season headache'."
            />
            <AppreciationCard 
              icon={<Sparkles className="text-brand-purple" />}
              title="Forward-Thinking Strategy"
              description="Not just looking at the past year, but helping plan for long-term financial health."
            />
          </div>
        </div>
      </section>

      {/* Individual Review Cards */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ReviewCard 
              name="Jennifer C."
              initials="JC"
              role="Small Business Owner"
              text="The fractional controller services provided by Your Tax Source have helped my business grow exponentially. Their insight is invaluable."
            />
            <ReviewCard 
              name="Glenn M."
              initials="GM"
              role="Independent Contractor"
              text="Easy, fast, and professional. The portal makes it so simple to upload documents while I'm on the road."
            />
            <ReviewCard 
              name="Carina W."
              initials="CW"
              role="Individual Filer"
              text="I used to dread taxes, but Jenn and her team make it so approachable. I'll never go anywhere else!"
            />
          </div>
        </div>
      </section>

      {/* Why Referrals Matter */}
      <section className="py-24 bg-brand-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-8">Why Referrals Matter</h2>
          <p className="text-xl text-gray-400 mb-12 leading-relaxed">
            As a boutique firm, we grow through the trust of our clients. 
            When you refer a friend or colleague, it's the highest compliment we can receive. 
            We are committed to providing every new client with the same 
            high-level care that earned your recommendation.
          </p>
          <div className="inline-flex items-center gap-2 bg-brand-purple/20 px-6 py-3 rounded-full border border-brand-purple/30">
            <Heart className="text-brand-purple fill-brand-purple" size={20} />
            <span className="font-bold uppercase tracking-widest text-sm">Growing Together</span>
          </div>
        </div>
      </section>

      {/* Google Reviews Placeholder */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 border-2 border-dashed border-gray-200 rounded-[3rem] p-12 md:p-20">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="fill-yellow-400 text-yellow-400" size={32} />
            ))}
          </div>
          <h2 className="text-3xl font-heading font-bold text-brand-black mb-6">4.9 Stars on Google</h2>
          <p className="text-lg text-brand-charcoal/70 mb-10">
            Check out more of our reviews on Google and see why we're Belmont's 
            top-rated tax advisory firm.
          </p>
          <button className="bg-white border-2 border-gray-200 text-brand-black px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 mx-auto">
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Leave a Google Review
          </button>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-brand-purple text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-8">Ready to be our next success story?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              href="/auth/signup"
              className="bg-white text-brand-purple px-10 py-5 rounded-2xl font-black text-xl hover:bg-brand-lavender transition-all shadow-xl uppercase tracking-wider"
            >
              Schedule a Consultation
            </Link>
            <Link
              href="/contact"
              className="bg-brand-black text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-gray-900 transition-all shadow-xl uppercase tracking-wider"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function AppreciationCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-md transition-all group">
      <div className="w-14 h-14 bg-brand-purple/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-purple/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-brand-black mb-4">{title}</h3>
      <p className="text-brand-charcoal/70 leading-relaxed font-medium">{description}</p>
    </div>
  );
}

function ReviewCard({ name, initials, role, text }: { name: string; initials: string; role: string; text: string }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col h-full">
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="fill-brand-purple text-brand-purple" size={16} />
        ))}
      </div>
      <p className="text-brand-charcoal/80 leading-relaxed font-medium mb-8 flex-grow">
        "{text}"
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-soft-gray rounded-full flex items-center justify-center text-brand-purple font-bold text-sm">
          {initials}
        </div>
        <div>
          <p className="font-bold text-brand-black text-sm">{name}</p>
          <p className="text-brand-charcoal/50 text-xs font-semibold uppercase tracking-tighter">{role}</p>
        </div>
      </div>
    </div>
  );
}
